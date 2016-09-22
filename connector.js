(function () {
    var myConnector = tableau.makeConnector();

	myConnector.getSchema = function (schemaCallback) {		
		// Table columns and datatypes.
		var tableColumns = [
			{ id : "currency_code_base", alias : "currency_code_base", dataType : tableau.dataTypeEnum.string },
			{ id : "currency_code_target", alias : "currency_code_target", dataType : tableau.dataTypeEnum.string },
			{ id : "exchange_rate", alias : "exchange_rate", dataType : tableau.dataTypeEnum.float }, 
			{ id : "date", alias : "date", dataType : tableau.dataTypeEnum.date }
		];
		// Table header info.
		var tableInfo = {
			id : "exchangerates",
			alias : "Exchange Rates",
			columns : tableColumns
		};
    schemaCallback([tableInfo]);
	};

	// Get currency data using Ajax and parse response to table.
    myConnector.getData = function(table, doneCallback) {
		// Check if currency is specified. Else get EUR rates.
		var formData = JSON.parse(tableau.connectionData);
		var currencyCode = (formData.baseCurrency == null ? "EUR" : formData.baseCurrency);
		var apiUrl = "https://api.fixer.io/latest?base=" + currencyCode;

		$.getJSON(apiUrl, function(resp){
			var tableData = [];	
			for(var key in resp.rates) {
				tableData.push({
					"currency_code_base" :  resp.base,
					"currency_code_target" : key,
					"exchange_rate" : resp.rates[key],
					"date" : resp.date
				});
			}
			
			table.appendRows(tableData)			
			doneCallback()
		});		
	};

    tableau.registerConnector(myConnector);		
})();

$(document).ready(function () {
	$("#submitButton").click(function () {
		// Load form data and pass it to wdc
		var formData = { baseCurrency : $('#currency-selector').val() };
		tableau.connectionData = JSON.stringify(formData);		
		
		tableau.connectionName = "Exchange Rates";
		tableau.submit();
	});
});