---
title: "Forecasting Inflation and GDP"
author: "Humberto Godinez"
date: "March 25, 2017"
output:
  html_document: default
  pdf_document: default
layout: post
categories: Finance
featured_image: /images/img_posts/annplot.jpeg

---

## The Balance Sheet, The Profit & Loss Statement and The Cash Flow

Fundamental analysis is a method of evaluating securities by attempting to measure the intrinsic value of a stock. 

**Assets = Liabilities + Shareholders(Equity)**

A cash flow statement shows liquidity while a profit and loss statement shows profitability.

Certain investments might seem like a decent return, but when inflation is factored in they can actually be sold at a loss. Central banks tend to reduce interest rates when growth (**GDP**, for example) becomes weak. **Unemployment** helps measure future spending behavior, as consumers are more likely to spend if they are confident that their jobs are secure.


Here I'm using an **Artificial Neural Network** approach to forecast two macroeconomic variables, Inflation and GDP.

## Data
* Federal Reserve Bank of San Louis (FRED).
* Quandl API
    * Free Access.
    * Macro and Regional.
    * Several Frequencies. 

<a href="https://fred.stlouisfed.org/" target="_blank">FRED</a> contains frequently updated US macro and regional economic time series at annual, quarterly, monthly, weekly, and daily frequencies. It aggregates economic data from a variety of sources- most of which are US government agencies. The economic time series in FRED contain observation or measurement periods associated with data values. 

<a href="https://www.quandl.com/" target="_blank">Quandl</a> is a platform for financial, economic, and alternative data that serves investment professionals. Quandl sources data from over 500 publishers. All Quandl's data are accessible via an API. 



## Correlation Analysis

The average annual log return, correlations and business cycles suggest there is no single model to forecast the Inflation. 

<div class="videoWrapper">
<iframe src="/htmlwidgets/post_ann/hc_1_corr.html" ></iframe> <a href="/htmlwidgets/post_ann/hc_1_corr.html" target="_blank">open</a> <small>Note: You can select the series by clicking over the name.</small>
</div>

<div class="videoWrapper">
<iframe src="/htmlwidgets/post_ann/hc_1_corr.html" ></iframe > <a href="/htmlwidgets/post_ann/hc_1_corr.html" target="_blank">open</a> <small>Note: You can select the series by clicking over the name.</small>
</div>


Given that there is no clear way to forecast the Inflation, **Neural Nets** can find hidden relations between several economic indicators and economies.

## Neural Net (NN)

Neural Networks are inspired by biological neural networks. Refers to the interconnections between the neurons in the different layers of each system. They are used to estimate or approximate functions.

Neural networks, according to <a href="https://books.google.com/books/about/Artificial_Neural_Networks.html?id=UulLrgEACAAJ" target="_blank">Roghani</a> are state-of-the-art, trainable algorithms that emulate certain major aspects in the functioning of the human brain. This gives them a unique, self-training ability, the ability to formalize unclassified information and, most importantly, the ability to make forecasts based on the historical information they have at their disposal.

A neural network can find complex relations between variables… BUT.. It is more likely to find them it if is given various technical indicators that are likely to be correlated. A successful NN absorbs must of the time in the pre-procession and selecting the governing input. 

The flow chart of a NN is: 

**Inputs (First layer) -> Synapses (data) -> weights-> learning process (update)-> activation function (hyperbolic tangent)->output**

For this project I'm using a Neural Net with the following characteristics:

* Backpropagation

* Hyperbolic tangent

* 21 Inputs

* 2 hidden layers

* 7 Neurons

* 1 Output

<div class="videoWrapper">
<iframe src="/htmlwidgets/post_ann/hc_ann.html" ></iframe> <a href="/htmlwidgets/post_ann/hc_ann.html" target="_blank">open</a> <small>Note: You can select the series by clicking over the name.</small>
</div>

The results are promising, the Neural Network shows interdependencies and patterns that other methods of technical analysis are unable to discover. It shows a better forecast than traditional time series models.
 


**For more info you can find a web-app here: <a href="https://hgodinez.shinyapps.io/EconomicFactors" target="_blank">Economic Factors</a>**