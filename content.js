var textchatref;

function check_buy(trend){
	textchatref.remove();
	$("#run_scan").click();
	setTimeout(function(){
    if($("#DataTables_Table_0 tbody tr .dataTables_empty").length === 0){
    	var arr = [];
	    $("#DataTables_Table_0 tbody tr").each(function(){
	      	textchatref.push(
	      		{
	      			name: $(this).find("td:eq(1)").text(), 
	      			symbol: $(this).find("td:eq(2)").text(),
	      			change: parseFloat($(this).find("td:eq(4)").text()),
	      			price: parseFloat($(this).find("td:eq(5)").text()),
	      			time: new Date().getTime()
	  			}
	  		);
	    });
    	var options = {
	      body: arr.join(),
	      icon: 'https://cdn0.iconfinder.com/data/icons/stock-market/512/'+trend+'_trend-512.png'
	  	};
	  	//var n = new Notification(trend === 'bull' ? 'Buy' : 'Sell', options);

    }
    
    setTimeout(function(){
			check_buy(trend);
    }, 70000);
  }, 2000);
}



function order_req(order, token){

	$.ajax({
	    url: 'https://kite.zerodha.com/api/orders/'+order.variety,
	    type: 'post',
	    data: order,
	    xhr: function() {
	        var xhr = jQuery.ajaxSettings.xhr();
	        var setRequestHeader = xhr.setRequestHeader;
	        xhr.setRequestHeader = function(name, value) {
	            if (name == 'X-Requested-With') return;
	            setRequestHeader.call(this, name, value);
	        }
	        return xhr;
	    },
	    headers: {
	        'X-CSRFToken': token,
	        'X-Kite-Version': '1.1.14'
	    },
	    dataType: 'json',
	    success: function (data) {
	        console.info(data);
	    }
	});

}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var href = window.location.href;
if(href.indexOf('https://chartink.com/screener/') !== -1){
	textchatref = new Firebase('https://sharemarket-52975.firebaseio.com/'+$('.inked h1:first').text()+'/');
	check_buy();
} else {
	textchatref = new Firebase('https://sharemarket-52975.firebaseio.com/');
	angular.module('todoApp', [])
		.filter('startFrom', function() {
		    return function(input, start) {
		    	if(input === undefined) {
		    		return [];
		    	} else {
		    		start = +start; //parse to int
		        	return input.slice(start);
		    	}
		    }
		})
	  .controller('TodoListController', function($scope, $timeout) {

	  	textchatref.on('value', function(snapshot) {
	  		 var results = snapshot.val();
	  		 var new_resuts = {};
	  		 angular.forEach(results, function(scre,k){
	  		 	new_resuts[k] = [];
	  		 	angular.forEach(scre, function(i2,k2){
	  		 		var filter_sym = instrument_list.filter(function(a){
	  		 			return a.name === i2.symbol;
	  		 		});
	  		 		if(filter_sym.length){
	  		 			i2.id = angular.copy(filter_sym[0].id);
	  		 			i2.quantity = 10;
	  		 			i2.stoploss = 2;
	  		 			i2.squareoff = 5;
	  		 			i2.trailing_stoploss = 2;
	  		 			i2.src = 'https://kite.zerodha.com/static/build/chart.html?v=1.1.12#token='+i2.id+'&symbol='+i2.symbol+'&segment=NSE&volume=true&public_token='+$scope.public_token+'&user_id='+$scope.user_id+'&inapp=true';
	  		 			new_resuts[k].push(angular.copy(i2));
	  		 		}
	  		 	});
	  		 });
	  		 console.log(new_resuts);
	  		 $scope.$apply(function(){
	  		 	$scope.screener_result = angular.copy(new_resuts);
	  		 });
	  	});

	  	$scope.screener_change = function(){
	  		$scope.currentPage = 0;
	  		$scope.noOfPage = Math.ceil($scope.screener_result[$scope.screener].length / 2);
	  		$scope.show_data = false;
	  		$timeout(function(){
	  			$scope.show_data = true;
	  		}, 500);
	  	};

	  	$scope.show_data = false;
	  	$scope.screener = '';
	  	$scope.currentPage = 0;

	    $scope.togglePlugin = function(){
	    	$(".container-right .page-content").toggle();
	    };

	    $scope.previous_page = function(){
	    	$scope.currentPage--;
	    	$scope.show_data = false;
	  		$timeout(function(){
	  			$scope.show_data = true;
	  		}, 500);
	    };

	    $scope.next_page = function(){
	    	$scope.currentPage++;
	    	$scope.show_data = false;
	  		$timeout(function(){
	  			$scope.show_data = true;
	  		}, 500);
	    };

	    $scope.order_req = function(od, transaction_type, product, variety, order_type){
	    	var data = {exchange:'NSE', tradingsymbol:od.symbol, transaction_type:transaction_type, 
			order_type:order_type, quantity:od.quantity, price:od.price, product:product, validity:'DAY', 
			disclosed_quantity:'0', trigger_price:'0', squareoff:od.squareoff, stoploss:od.stoploss, 
			trailing_stoploss:od.trailing_stoploss, variety:variety};
	    	order_req(data, $scope.public_token);
	    };

	    $scope.user_id = getCookie('user_id');
	    $scope.public_token = getCookie('public_token');

	    $scope.screener_result = [];
	  });

	  var $injector = angular.injector(['ng', 'todoApp']);

	  setTimeout(function(){
	  	$injector.invoke(function($rootScope, $compile) { 
		    $template = `<div class="kiteCustomization" ng-app="todoApp" ng-controller="TodoListController">
		        	<div class="toggle-btn">
		        		<label class="switch">
						  <input type="checkbox" ng-model="toggle" ng-change="togglePlugin();">
						  <span class="slider round"></span>
						</label>
	        		</div>
		        	<div ng-if="toggle" class="page-content">
		        		<div>
		        			<label>Screener</label>
		        			<select ng-model="$parent.screener" ng-change="screener_change();">
		        				<option value="">Select Screener</option>
		        				<option ng-repeat="(k,v) in screener_result" ng-show="v.length" value="{{k}}">{{k}}({{v.length}})</option>
		        			</select>
		        			<div ng-show="screener" class="pagination">
		        				<span>{{currentPage+1}} out of {{noOfPage}} page</span>
		        				<span ng-hide="currentPage === 0" ng-click="previous_page();" class="change-indicator icon icon-chevron-left"></span>
		        				<span ng-hide="currentPage === noOfPage - 1" ng-click="next_page();" class="change-indicator icon icon-chevron-right"></span>
		        			</div>
		        		</div>
		        		<div>
		        			<div ng-if="screener && show_data" ng-repeat="stock in screener_result[screener] | startFrom:currentPage*2 | limitTo:2  track by $index">
		        				<iframe ng-src="{{stock.src}}"></iframe>
		        				<div class="stock_container">
		        					<h4>{{stock.name}}</h4>
		        					<div>
		        						<span class="stock_price">{{stock.price}}</span>
		        						<span ng-class="{'change-up': stock.change > 0, 'change-down': stock.change < 0}">
		        							<span ng-class="{'icon-chevron-up': stock.change > 0, 'icon-chevron-down': stock.change < 0}" class="change-indicator icon "></span>
		        							&nbsp;{{stock.change}}
		        						</span>
		        					</div>
		        					<hr>
		        					<div class="stock_data">
		        						PRICE<input style="width:75px;" ng-model="stock.price">&nbsp;
		        						QTY<input ng-model="stock.quantity"><br>
		        						SL<input ng-model="stock.stoploss">&nbsp;
		        						TGT<input ng-model="stock.squareoff">&nbsp;
		        						TSL<input ng-model="stock.trailing_stoploss">&nbsp;
		        					</div>
		        					<hr>
		        					<div class="stock_buy">
		        						<button ng-click="order_req(stock, 'BUY', 'CNC', 'regular', 'MARKET')" class="button-blue">CNC</button>
		        						<button ng-click="order_req(stock, 'BUY', 'MIS', 'regular', 'MARKET')" class="button-blue">MIS-M</button>
		        						<button ng-click="order_req(stock, 'BUY', 'MIS', 'regular', 'LIMIT')" class="button-blue">MIS-L</button>
		        						<button ng-click="order_req(stock, 'BUY', 'MIS', 'bo', 'LIMIT')" class="button-blue">BO</button>
		        					</div>
		        					<hr>
		        					<div class="stock_sell">
		        						<button ng-click="order_req(stock, 'SELL', 'CNC', 'regular', 'MARKET')" class="button-orange">CNC</button>
		        						<button ng-click="order_req(stock, 'SELL', 'CNC', 'regular', 'MARKET')" class="button-orange">MIS-M</button>
		        						<button ng-click="order_req(stock, 'SELL', 'CNC', 'regular', 'LIMIT')" class="button-orange">MIS-L</button>
		        						<button ng-click="order_req(stock, 'SELL', 'CNC', 'bo', 'LIMIT')" class="button-orange">BO</button>
		        					</div>
		        				</div>

		        			</div>
		        		</div>
		        	</div>
		        </div>`;
		    if(href.indexOf('kite.zerodha.com') !== -1){
		    	$('.container-right').prepend($compile($template)($rootScope)); 
		    } else {
		    	$('body').prepend($compile($template)($rootScope)); 
		    }
		  });
	  }, 5000);
	  
}