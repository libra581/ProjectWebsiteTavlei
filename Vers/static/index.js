;
jQuery(function($){    
    'use strict';

    var IO = {

        socket:'',

        init: function() {
            IO.socket = io.connect();
            IO.bindEvents();
        },

        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('error1', IO.error1 );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('fieldChanged', App.onFieldChanged );
			      IO.socket.on('pingPlayer', App.onPingPlayer);
            IO.socket.on('sendMsgChat', App.onSendMsgChat);
            IO.socket.on('endGame', App.onEndGame);
            IO.socket.on('serverPing', App.onServerPing);
            IO.socket.on('playerDisconnect', App.onPlayerDisconnect);
            IO.socket.on('updateStep', App.onUpdateStep);
        },

        

        onConnected : function() {
            App.mySocketId = IO.socket.id;
        },

        onNewGameCreated : function(data) {
            App.Host.gameInit(data);
        },

        playerJoinedRoom : function(data, field, yourColor) {

            //console.log("playerJoinedRoom" + (sizeof(data)+sizeof(field)+sizeof(yourColor)))

            App.gameId = data.gameId

            IO.socket.emit('clientPong', App.gameId);

            if(App.Host.color == "")
              App.Host.color = yourColor;
            
            App.updateWaitingScreen(data, field);
        },

        error1 : function(data) {
            alert(data.message);
        }

    };

    var App = {

        gameId: 0,

        myRole: '',   

        mySocketId: '',

        currentRound: 0,

        color: "",

        sec: 15,

        intervalID: "",

        timeoutID: "",


        init: function () {
          $(document).ready(function() {            
              App.cacheElements();
              App.showInitScreen();
              App.bindEvents();


            });
        },

         cacheElements: function () {
              App.$doc = $(document);
              App.$gameArea = $('#game');
              App.$templateStartMenu = $('#start-menu-template').html();
              App.$templateNewGame = $('#create-game-template').html();
              App.$templateJoinGame = $('#join-game-template').html();
              App.$templateGame = $('#game-template').html();
              App.$templateSelectGame = $('#select-color-template').html();
       },


        bindEvents: function () {
            App.$doc.on('click', '#btnCreateGame', App.Host.onSelectColor);
            App.$doc.on('click', '#btnContinue', App.Host.onCreateClick);

            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
       },

        showInitScreen: function() {
            App.$gameArea.html(App.$templateStartMenu);
        },


        onFieldChanged: function(field){
            //console.log("FieldChanged "+sizeof(field))
             clearTimeout(App.timeoutID)
             clearInterval(App.intervalID)
             App.setField({field: field.field}, field.color);
        },
		
	
        onEndGame :function(color) {
             alert("Победа " + color )
             App.$gameArea.html(App.$templateStartMenu );             
        },


        updateLabelTurn: function(){

        },
       
        onUpdateStep: function(color){
          App.sec=15

          if(color==App.Host.color)
          {
            clearInterval(App.intervalID);

              App.intervalID = setInterval(function(){
                  App.sec-=1            
                  $('#turn').html(document.getElementById("turn").innerHTML.split(":")[0]+": "+App.sec+" сек")
                  if(App.sec==0)
                  {
                     App.sec=15
                     clearInterval(App.intervalID);
                     IO.socket.emit('clientSkip', App.gameId, App.Host.color);
                  }              
              },1000)  
          }
          else
          {
            App.intervalID = setInterval(function(){
                  App.sec-=1            
                  $('#turn').html(document.getElementById("turn").innerHTML.split(":")[0]+": "+App.sec+" сек")
                  if(App.sec==0)
                  {
                     App.sec=15
                     clearInterval(App.intervalID);
                  }              
              },1000)  
          }

                  
        },

        

        updateWaitingScreen: function(data, field) {
                $('#playersWaiting')
                    .append('<p/>')
                    .text('Player ' + data.playerName + ' joined the game.');

               App.$gameArea.html(App.$templateGame);

               

               App.setField({field: field.field}, field.color);


               $('.gamecell').click(function(e) {

                  //console.log("clickCell"+(sizeof($(this).html().charCodeAt(0))+Number(36)+sizeof($(this).attr('id').split('_'))));

                  IO.socket.emit('clickCell', $(this).html().charCodeAt(0), data.gameId, $(this).attr('id').split('_'));

                  //сброс подсветки фигур
                  var arr = document.getElementsByClassName('gamecell');
                  for (let item of arr) {
                      item.style.backgroundColor = "";
                  }
                

                  //подсветка фигур
                  if(App.Host.color == "Black" )
                  {
                    if($(this).html().charCodeAt(0) == 9823)
                    {
                      if(App.color != App.Host.color)
                      {
                        e.target.style.backgroundColor = "yellow";
                      }
                      else
                      {
                        e.target.style.backgroundColor = "green";
                        App.setTipFigure(e, arr);
                      }
                    }
                    else if ($(this).html().charCodeAt(0) == 9817 || $(this).html().charCodeAt(0) == 9812) 
                    {
                      e.target.style.backgroundColor = "red";
                    }
                  }
                  else if(App.Host.color == "White")
                  {
                     if($(this).html().charCodeAt(0) == 9823)
                    {
                      e.target.style.backgroundColor = "red";
                    }
                    else if ($(this).html().charCodeAt(0) == 9817 || $(this).html().charCodeAt(0) == 9812) 
                    {
                      if(App.color != App.Host.color)
                      {
                        e.target.style.backgroundColor = "yellow";
                      }
                      else
                      {
                        e.target.style.backgroundColor = "green";
                        App.setTipFigure(e, arr);
                      }
                    }
                  }         

                });

               $('.glyphicon-share-alt').click(function(){
                    IO.socket.emit('clickChatSend', $(".mytext")[0].value, data.gameId, App.Host.color);
                })

            },

            setTipFigure: function(tagClicked, arrHtmlTags){

                  var x = tagClicked.target.id.split('_')[1];
                  var y = tagClicked.target.id.split('_')[0];

                  //Подсветка вниз
                  for (var i = 11*Number(x)+Number(y)-1; i < arrHtmlTags.length; i+=11) {
                      if(arrHtmlTags[i].innerHTML === "")
                      {
                        if($(arrHtmlTags[i]).attr('class').indexOf("king-place") < 0
                          || tagClicked.target.innerHTML.charCodeAt(0) == 9812)
                          arrHtmlTags[i].style.backgroundColor = "gray";
                      }
                      else
                      {
                        break;
                      }
                  }

                  //Подсветка вверх
                  for (var i = 11*Number(x)+Number(y)-11*2-1; i>=0; i-=11) {
                      if(arrHtmlTags[i].innerHTML === "")
                      {
                        if($(arrHtmlTags[i]).attr('class').indexOf("king-place") < 0
                          || tagClicked.target.innerHTML.charCodeAt(0) == 9812)
                          arrHtmlTags[i].style.backgroundColor = "gray";
                      }
                      else
                      {
                        break;
                      }
                  }

                  //Подсветка вправо
                  for (var i = 11*Number(x)+Number(y)-11; i < arrHtmlTags.length && (i%11!=0); i+=1) {
                      if(arrHtmlTags[i].innerHTML === "")
                      {
                        if($(arrHtmlTags[i]).attr('class').indexOf("king-place") < 0
                          || tagClicked.target.innerHTML.charCodeAt(0) == 9812)
                            arrHtmlTags[i].style.backgroundColor = "gray";
                      }
                      else
                      {
                        break;
                      }
                  }

                  //Подсветка влево
                  for (var i = 11*Number(x)+Number(y)-11-2; i < arrHtmlTags.length && ((i+1)%11!=0); i-=1) {
                      if(arrHtmlTags[i].innerHTML === "")
                      {
                        if($(arrHtmlTags[i]).attr('class').indexOf("king-place") < 0
                          || tagClicked.target.innerHTML.charCodeAt(0) == 9812)
                          
                          arrHtmlTags[i].style.backgroundColor = "gray";
                      }
                      else
                      {
                        break;
                      }
                  }
            },

            setField: function(field, color) {
                if (document.getElementById('turn'))
        				{
                  if(color.indexOf("White") >= 0 )
                  {
        					   $('#turn').html("Ходят белые: 15 сек" )
                  }
                  else
                  {
                     $('#turn').html("Ходят черные: 15 сек" )
                  }
        				}

                App.color = color
        				
        				for (var i = 1; i <= 11; i++) {
                  for (var j = 1; j <= 11; j++) 
                  if (field.field[i][j] != undefined)
                  {
                      switch(field.field[i][j].type) {
                      case 'b_pawn': 
                        $('#' + i + '_' + j).html('&#9823;');
                        break

                      case 'w_pawn':  
                        $('#' + i + '_' + j).html('&#9817;');
                        break

                      case 'w_king':  
                        $('#' + i + '_' + j).html('&#9812;');
                        break
                      default:
                        null
                        break
                    }

                  }
                  else
                  {
                      $('#' + i + '_' + j).html('');
                  }
                }
				
            },


        onSendMsgChat: function(msg, color){
            var control = "";

            if(color === App.Host.color)
            {
              control = '<li style="width:100%">' +
                        '<div class="msj macro">' +
                        '<div class="avatar"><img class="img-circle" style="width:100%;" src="" /></div>' +
                            '<div class="text text-l">' +
                                '<p>'+ msg +'</p>' +
                                '<p><small>'+color+'</small></p>' +
                            '</div>' +
                        '</div>' +
                    '</li>';      
            }
            else
            {
              control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                                '<p>'+msg+'</p>' +
                                '<p><small>'+((App.Host.color==="White")?"Black":"White")+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="" /></div>' +                                
                  '</li>';
            }

             $("ul").append(control).scrollTop($("ul").prop('scrollHeight'));
        },

        onServerPing: function(msg){
          IO.socket.emit('clientPong', App.gameId);
        },

        onPlayerDisconnect: function(msg){
          var object =
    {
      'boolean' : true,
      'number'  : 1,
      'string'  : 'a',
      'array'   : [1, 2, 3]
    };
             //console.log(typeof(this._callbacks.$playerDisconnect))
             //console.log(sizeof(this))
             alert("Ваш противник сбежал как трус!")
             App.$gameArea.html(App.$templateStartMenu);   
        },


        Host : {

            players : [],

            isNewGame : false,

            numPlayersInRoom: 0,

            currentCorrectAnswer: '',

            color: "",

            onCreateClick: function () {
                var color = "White"

                var rad = document.getElementsByName('color')
                for (var i = 0; i < rad.length; ++i) 
                {
                  if(rad[i].checked)
                  {
                      color = rad[i].value
                  } 
                }
                IO.socket.emit('hostCreateNewGame', color, $('#inputNickname').val() || 'Lepisto')

                App.Host.color = color
            },

             onSelectColor: function() {
            App.$gameArea.html(App.$templateSelectGame);
           },

              gameInit: function (roomId) {
                App.gameId = roomId
                App.Host.displayNewGameScreen();
                // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
            },

            displayNewGameScreen : function() {
                // Fill the game screen with the appropriate HTML
                App.$gameArea.html(App.$templateNewGame );

                // Display the URL on screen
                $('#gameURL').text(window.location.href);
                //App.doTextFit('#gameURL');

                // Show the gameId / room id on screen
                document.getElementById('spanNewGameCode').value = App.gameId;
            },
            
   
        },

        Player : {

            hostSocketId: '',

            myName: '',

             onJoinClick: function () {
                App.$gameArea.html(App.$templateJoinGame);
            },

              onPlayerStartClick: function() {
                var data = {
                    gameId : ($('#inputGameId').val()),
                    playerName : $('#inputPlayerName').val() || 'Lepisto'
                };

                //console.log("playerJoinGame "+sizeof(data))

                IO.socket.emit('playerJoinGame', data);

                App.Player.myName = data.playerName;
            },
        },
   
    };

    IO.init();
    App.init();

}($));


