from flask import Flask, request, Response
import pandas as pd
from flask_cors import CORS
from statsmodels.tsa.statespace.sarimax import # `SARIMAX` is a function from the `statsmodels`
# library in Python that is used for time series
# forecasting. It stands for Seasonal AutoRegressive
# Integrated Moving Average with eXogenous regressors.
# It is an extension of the ARIMA model that allows for
# the inclusion of exogenous variables in the model. In
# this code, `SARIMAX` is used to fit a time series
# model to the sales data and make predictions for
# future sales.
SARIMAX
from sklearn.metrics import r2_score
import itertools

app = Flask(__name__)
# `CORS(app)` is enabling Cross-Origin Resource Sharing (CORS) for the Flask application. This allows
# the application to make requests to and receive responses from a different domain than the one the
# application is hosted on.
CORS(app)


@app.route('/', methods=['POST'])
def upload():
    file = request.files['csvFile']
    if file.filename == '':
        return 'No file selected'

    file.save(file.filename)
    print("File saved successfully")

    periodicity = request.form['periodicity']
    periods = int(request.form['periods'])

# `df = pd.read_csv(file.filename)` is reading a CSV file and storing its contents in a pandas
# DataFrame called `df`. The `file.filename` argument specifies the name of the CSV file to be read.
    df = pd.read_csv(file.filename)

    # These lines of code are performing the following operations:
    # - `df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])`: This line is converting the
    # 'InvoiceDate' column of the DataFrame `df` to a datetime format using the `pd.to_datetime()`
    # function from the pandas library.
    # - `df['Sales'] = df['Quantity'] * df['UnitPrice']`: This line is creating a new column called
    # 'Sales' in the DataFrame `df` by multiplying the 'Quantity' and 'UnitPrice' columns together.
    # - `df = df.groupby(pd.Grouper(key='InvoiceDate', freq=periodicity)).agg({'Sales':
    # 'sum'}).reset_index()`: This line is grouping the DataFrame `df` by the 'InvoiceDate' column at
    # a frequency specified by the `periodicity` variable (e.g. daily, weekly, monthly), and then
    # aggregating the 'Sales' column by summing the values for each group. The resulting DataFrame is
    # then reset to have a new index. This step is often performed in time series analysis to
    # aggregate data at a desired frequency for forecasting purposes.
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df['Sales'] = df['Quantity'] * df['UnitPrice']
    df = df.groupby(pd.Grouper(key='InvoiceDate', freq=periodicity)).agg(
        {'Sales': 'sum'}).reset_index()

# `df['InvoiceDate'].fillna(-1, inplace=True)` is filling any missing values in the 'InvoiceDate'
# column of the DataFrame `df` with the value -1. The `fillna()` method is a pandas method that is
# used to fill missing values in a DataFrame or Series object. The `inplace=True` argument specifies
# that the operation should be performed on the DataFrame `df` itself, rather than returning a new
# DataFrame.
    df['InvoiceDate'].fillna(-1, inplace=True)
# These lines of code are splitting the original DataFrame `df` into two separate DataFrames:
# `train_data` and `test_data`.
    train_data = df.iloc[:-periods, :]
    test_data = df.iloc[-periods:, :]

    # These lines of code are creating new columns in the `train_data` DataFrame that represent the
    # day of the week, day of the year, month, and quarter for each date in the `InvoiceDate` column.
    # The `dt` attribute is used to access the datetime properties of the `InvoiceDate` column, and
    # the `dayofweek`, `day_of_year`, `month`, and `quarter` attributes are used to extract the
    # corresponding values for each date. These new columns may be used as features in the time series
    # model to improve its accuracy.
    train_data['day_of_week'] = train_data['InvoiceDate'].dt.dayofweek
    train_data['day_of_year'] = train_data['InvoiceDate'].dt.day_of_year
    train_data['month'] = train_data['InvoiceDate'].dt.month
    train_data['quarter'] = train_data['InvoiceDate'].dt.quarter

    # `param_grid` is a dictionary that contains the hyperparameters for the SARIMAX model. The
    # `order` parameter specifies the order of the autoregressive (AR), integrated (I), and moving
    # average (MA) terms in the model, while the `seasonal_order` parameter specifies the same for the
    # seasonal component of the model. The values in the tuples represent the number of AR, I, and MA
    # terms, as well as the length of the seasonal cycle (in this case, 7 days). The
    # `itertools.product()` function is used to generate all possible combinations of the
    # hyperparameters specified in `param_grid`, and the model with the best performance (as measured
    # by the R-squared score) on the test data is selected.
    param_grid = {
        'order': [(1, 0, 0), (2, 0, 0)],
        'seasonal_order': [(1, 0, 0, 7), (2, 0, 0, 7)]
    }

    # These two lines of code are initializing variables `best_r2` and `best_params` to keep track of
    # the best R-squared score and corresponding hyperparameters found during the hyperparameter
    # tuning process.
    best_r2 = float('-inf')
    best_params = None

    # //arima - auto regressive moving algorithm
    # //arimax - same as arimax new line from outside
    # //sarimax - seasional arima x algorithm - adding seasonality 

    for params in itertools.product(param_grid['order'], param_grid['seasonal_order']):
        model = SARIMAX(train_data['Sales'],
                        order=params[0], seasonal_order=params[1])
        model_fit = model.fit(disp=0)

        test_data['day_of_week'] = test_data['InvoiceDate'].dt.dayofweek
        test_data['day_of_year'] = test_data['InvoiceDate'].dt.day_of_year
        test_data['month'] = test_data['InvoiceDate'].dt.month
        test_data['quarter'] = test_data['InvoiceDate'].dt.quarter
# //output
        y_pred = model_fit.predict(
            start=test_data.index[0], end=test_data.index[-1])

        r2 = r2_score(test_data['Sales'], y_pred)

        if r2 > best_r2:
            best_r2 = r2
            best_params = params
            best_y_pred = y_pred
# //generate graph
    pred_sales = pd.DataFrame({'Sales': best_y_pred})
    pred_sales.index = pd.date_range(start=train_data['InvoiceDate'].max(
    ) + pd.Timedelta(days=1), periods=periods, freq=periodicity)

    output = pred_sales.to_csv(header=True)
# //gives csv file as ouput
    return Response(
        f'R2 Score: {best_r2}\n' + output,
        mimetype="text/csv",
        headers={"Content-disposition":
                 "attachment; filename=predicted_sales.csv"})


@app.route('/', methods=['GET'])
def up():
    return "<h3>Sales Forecasting Prediction</h3>"


if __name__ == '__main__':
    app.run(debug=False)
