$('document').ready(function () {
	(function(Calls) {

		// ApiKeys array to "no" limit of concurrent users
		var peerJSApiKeys = ["l8hbbvlnmy0newmi", "whpxqb4w1zqto6r", "wz8ff1dkcg88semi", "mtfm2829j36av2t9", "9fbqdbdd7kzz1tt9", "2vyaq0dn4qp8pvi", "n2lcre9pnpi7ldi", "zgb447roces9vn29", "qsm2h2ge609hpvi", "4nf2qfukg0jurf6r", "l69r7wgviktn8kt9", "4n5ruuusyw7mn29", "t29lksk4w1zqto6r", "0pc88wc9cmqgp66r"];
		
		init = function()
		{
			//require(['Peer'], function (Peer) {
				// Listeners for calls
				socket.on("plugins.incomingCall."+app.user.uid, function(data){
					if(app.user.status && app.user.status == "online")
					{	// Only show incoming calls if im online
						app.alert({
							type: 'success',
							timeout: 0,
							title: 'Llamada Entrante',
							message: ""+data.username+" te esta llamando. <br> <a id='answerCall'>Responder</a> | <a id='closeCall'>Rechazar</a> <video style='display:none;' autoplay id='callStream'></video>",
							alert_id: 'actualCall_'+data.username
						});
						setTimeout(function(){
							$("#alert_button_actualCall_"+data.username).find(".close").hide();
							$("#answerCall").on("click", function(){
								// Use the same apikey that caller
								setApiKey(data.apikey);
								app.user.peer.actualCallUsername = data.username;
								listenForCalls();
								app.user.peer.on('open', function(){
									socket.emit("plugins.acceptedIncomingCall", {peerid:app.user.peer.id, youruid:data.uid});
								    app.alert({
										type: 'success',
										timeout: 7000,
										title: 'Conectando..',
										message: "Preparando llamada con "+data.username+" ..",
										alert_id: 'actualCall_'+data.username
									});
								});
							});
							$("#closeCall").on("click", function(){
							    $("#alert_button_actualCall_"+data.username).remove();
							});
						}, 200);
					}
				});

				socket.on("plugins.acceptedIncomingCall."+app.user.uid, function(data){
					// Call to the peer
					app.user.peer.actualCallUsername = data.username;
					navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
					navigator.getUserMedia({video: false, audio: true}, function(stream) {
						listenForCalls();
					  var call = app.user.peer.call(data.peerid, stream);
					  app.user.call[call.id] = call;
					  call.answer(stream); // Answer the call with an A/V stream.
						call.on('stream', function(remoteStream) {
						  // Show stream in some video/canvas element.
						  console.log("RECIBO!!");
						  $("#alert_button_actualCall_"+this.id).find('#callStream').prop('src', URL.createObjectURL(remoteStream));
						  //console.log("Received stream..");
						});
						call.on("close", function(){
							var cid = call.id;
							$("#alert_button_actualCall_"+cid).remove();
						});
					  	app.alert({
							type: 'success',
							timeout: 0,
							title: 'Llamada en curso',
							message: "Hablando con "+data.username+". <br> <a id='closeCall'>Colgar</a> <video style='display:none;' autoplay id='callStream'></video>",
							alert_id: 'actualCall_'+call.id
						});
					  	setTimeout(function(){
					  		$("#alert_button_actualCall_"+call.id).find(".close").hide();
							$("#closeCall").on("click", function(){
								var cid = call.id;
							    app.user.call[cid].close();
							    $("#alert_button_actualCall_"+cid).remove();
							});
						}, 200);
					}, function(err) {
					  console.log('Failed to get local stream' ,err);
					});
				});

				// Call button on profile
				$(window).on('action:ajaxify.contentLoaded', function () {
					try{
						if( document.URL.indexOf("/user") > -1 && $("#chat-btn") )
						{	// Si estamos en el perfil de un usuario, ponemos los botones y demas
							$($("#chat-btn").parent()).append('<br><br><a href="#" class="btn btn-primary" onclick="callUser()"> ExoCall</br><i class="fa fa-phone-square" style="font-size:25px"></i></a>');
						}
					}catch(e){
					}
				});

				// Prepare for call answer
				listenForCalls = function()
				{
					navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
					app.user.peer.on('call', function(call) {
						app.user.call[call.id] = call;
					  	navigator.getUserMedia({video: false, audio: true}, function(stream) {
					  		app.alert({
								type: 'success',
								timeout: 0,
								title: 'Llamada en curso',
								message: "Hablando con "+app.user.peer.actualCallUsername+". <br> <a id='closeCall'>Colgar</a> <video style='display:none;' autoplay id='callStream'></video>",
								alert_id: 'actualCall_'+call.id
							});
						  	call.answer(stream); // Answer the call with an A/V stream.
						  	app.user.call[call.id] = call;
							app.user.call[call.id].answer(stream); // Answer the call with an A/V stream.
							call.on('stream', function(remoteStream) {
							  // Show stream in some video/canvas element.
							  var cid = call.id;
							  $("#alert_button_actualCall_"+cid).find('#callStream').prop('src', URL.createObjectURL(remoteStream));
							  console.log(cid);
							});
							call.on("close", function(){
								var cid = call.id;
								$("#alert_button_actualCall_"+cid).remove();
							});
						  	setTimeout(function(){
						  		$("#alert_button_actualCall_"+call.id).find(".close").hide();
								$("#closeCall").on("click", function(){
									var cid = call.id;
								    app.user.call[cid].close();
								    $("#alert_button_actualCall_"+cid).remove();
								});
							}, 200);
						}, function(err) {
						  console.log('Failed to get local stream' ,err);
						});
					});
				}
				
			//});
		}

		setRandomApiKey = function()
		{
			if(!app.user.peer)
			{
				var MAXRAND = peerJSApiKeys.length;
				var randomKey = Math.floor(Math.random() * MAXRAND);
				app.user.peer = new Peer({key: peerJSApiKeys[randomKey]});
				app.user.call = {};
				app.user.peer.peerApiKey = peerJSApiKeys[randomKey];
			}
		}

		setApiKey = function(key)
		{
			app.user.peer = new Peer({key: key});
			app.user.peer.peerApiKey = key;

			if(!app.user.call)
			{
				app.user.call = {};
			}
		}

		callUser = function()
		{
			var uid = $(".account").attr("data-uid");
			setRandomApiKey();
			socket.emit("plugins.callUser", {uid:uid, apikey:app.user.peer.peerApiKey}, function(err,data){
				if(err)
				{
					app.alert({
						type: 'danger',
						timeout: 5000,
						title: 'Error',
						message: "Para llamar a este usuario debe estar siguiendote",
						alert_id: 'actualCall'
					});
				}
				else
				{
					app.alert({
						type: 'success',
						timeout: 5000,
						title: 'Llamando..',
						message: "Si responde a la llamada deberás permitir el acceso al micro y empezar a hablar con el/ella.",
						alert_id: 'actualCall'
					});
				}
			});
		}

		init();

	})(window.Calls);
});
