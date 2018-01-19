(function($){
	$(function(){
		var gateOpen=false;
		var totalTickCount=0;
		var sagaCount = 0;
		var brokerQueue = [];
		var servicesQueue = {};
		
		var demoTypeHandlers = {
				"showBusyOnly" : function(){
					$('.saga').hide();
					$('.queue').hide();
					$('.queues').hide();
				},
				"showBusyAndSaga" : function(){
					$('.saga').show();
					$('.queue').hide();
					$('.queues').hide();
				},
				
				"showQueueSize" : function(){
					$('.saga').show();
					$('.queue').show();
					$('.queues').hide();
				},
				"showQueDetails" : function(){
					$('.saga').show();
					$('.queue').show();
					$('.queues').show();
					
				},
				
			};
		
		$('#demoType').change(function(){
			demoTypeHandlers[$('#demoType').val()]();
		});
		
		demoTypeHandlers[$('#demoType').val()]();
		$('.btn-start').prop('disabled', false);
		$('.btn-stop').prop('disabled', true);
		$('.btn-pause').prop('disabled', true);
		
		$('.btn-start').click(function(){
			var i;
			var count=parseInt($('#initialQueueSize').val());
			brokerQueue = [];
			servicesQueue = {};
			sagaCount = 0;
			totalTickCount=0;
			$('#totalTickCount').text('0');
		
			$('.service').each(function(){
				var serviceQueueName = $(this).attr('inputQueueName');
				servicesQueue[''+serviceQueueName]=[];
			});
			
			for(i=0; i<count;i++){
				brokerQueue.push('A');
			}
			
			gateOpen=true;
			cycle();
			$('.btn-start').prop('disabled', true);
			$('.btn-stop').prop('disabled', false);
			$('.btn-pause').prop('disabled', false).removeClass('paused');
		});
		
		$('.btn-stop').click(function(){
			gateOpen=false;
			$('.btn-start').prop('disabled', false);
			$('.btn-stop').prop('disabled', true);
			$('.btn-pause').prop('disabled', true).removeClass('paused');
			$('.broker>img').attr('src','img/broker.png');
			$('.service>img').attr('src','img/service.png');
		});
		
		$('.btn-pause').click(function(){
			console.log('btn-pause');
			gateOpen=!gateOpen;
			if(gateOpen){
				$('.btn-pause').removeClass('paused');
				cycle();
			}else{
				$('.btn-pause').addClass('paused')
			}
		});
		
		function handleBroker(){
			var threadCount = parseInt($('div.broker').find('input.threadCount').val());
			var i, nextItem;
			
			for(i=0; i<threadCount; i++){
				if(brokerQueue.length===0){
					return;
				}
				
				nextItem=brokerQueue.shift();
				console.log(nextItem);
				if('A'===nextItem){
					sagaCount++;
				}
				
				if(servicesQueue[nextItem]){
					servicesQueue[nextItem].push(nextItem);
				}else{
					sagaCount--;
				}
			}
		}
		
		function handleService(serviceQueueName){
			var threadCount = parseInt($('.service[inputQueueName=\''+serviceQueueName+'\']').find('input.threadCount').val());
			var i, nextItem;
			//console.log(threadCount);
			var queue=servicesQueue[serviceQueueName];
			for(i=0; i<threadCount; i++){
				if(queue.length===0){
					return;
				}
				
				nextItem=queue.shift();
				
				brokerQueue.push(String.fromCharCode(nextItem.charCodeAt()+1));
				
			}
		}
		
		
		function tickFunction(){
			var serviceQueueName;
			
			var queueSum=brokerQueue.length;
			
			for(serviceQueueName in servicesQueue){
				queueSum+=servicesQueue[serviceQueueName].length;
			}
			
			if(queueSum===0){
				gateOpen=false;
				$('.btn-start').prop('disabled', false);
				$('.btn-stop').prop('disabled', true);
				$('.btn-pause').prop('disabled', true);
				$('.broker>img').attr('src','img/broker.png');
				$('.service>img').attr('src','img/service.png');
			}else{
				totalTickCount++;
				$('#totalTickCount').text(''+totalTickCount);
				
			}
			
			for(serviceQueueName in servicesQueue){
				$('.service[inputQueueName=\''+serviceQueueName+'\']>div.queue>span.count').text(''+servicesQueue[serviceQueueName].length);
				$('.serviceQueue[inputQueueName=\''+serviceQueueName+'\']>span').text(servicesQueue[serviceQueueName].join(''));
				
				if(servicesQueue[serviceQueueName].length>0){
					$('.service[inputQueueName=\''+serviceQueueName+'\']>img').attr('src','img/service-busy.png');
					
				}else{
					$('.service[inputQueueName=\''+serviceQueueName+'\']>img').attr('src','img/service-free.png');
				}
					
			}
			
			$('.brokerQueue>span').text(''+brokerQueue.join(''));
			$('.broker>div.queue>span.count').text(''+brokerQueue.length);
			$('.broker>div.saga>span.count').text(''+sagaCount);
			if(brokerQueue.length>0){
				$('.broker>img').attr('src','img/broker-busy.png');
			}else{
				$('.broker>img').attr('src','img/broker-free.png');
			}
			
			var currentBrokerQueueLength = brokerQueue.length;
			
			for(serviceQueueName in servicesQueue){
				if(servicesQueue[serviceQueueName].length>0){
					handleService(serviceQueueName);
				}
			}
			
			if(currentBrokerQueueLength>0){
				handleBroker();
			}
		};
		
		var cycle = function(){
			if(gateOpen){
				tickFunction();
				window.setTimeout(cycle,parseInt($('#timerSpeed').val()));
			};
		}
	});
}(jQuery));