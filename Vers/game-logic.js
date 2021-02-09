var io;
var gameSocket;

var host_rooms = {};


function sizeof(object){

  // initialise the list of objects and size
  var objects = [object];
  var size    = 0;

  // loop over the objects
  for (var index = 0; index < objects.length; index ++){

    // determine the type of the object
    switch (typeof objects[index]){

      // the object is a boolean
      case 'boolean': size += 4; break;

      // the object is a number
      case 'number': size += 8; break;

      // the object is a string
      case 'string': size += 2 * objects[index].length; break;

      // the object is a generic object
      case 'object':

        // if the object is not an array, add the sizes of the keys
        if (Object.prototype.toString.call(objects[index]) != '[object Array]'){
          for (var key in objects[index]) size += 2 * key.length;
        }

        // loop over the keys
        for (var key in objects[index]){

          // determine whether the value has already been processed
          var processed = false;
          for (var search = 0; search < objects.length; search ++){
            if (objects[search] === objects[index][key]){
              processed = true;
              break;
            }
          }

          // queue the value to be processed if appropriate
          if (!processed) objects.push(objects[index][key]);

        }

    }

  }

  // return the calculated size
  return size;

}


setInterval(function ping(){

      for (room in host_rooms)
      {
        if(host_rooms[room] != undefined)
        {
          host_rooms[room].flagPing = 0
          io.sockets.to(room).emit('serverPing', 1);  
        }
      }


      setTimeout(function disc(){
        for (room in host_rooms)
        {
          if(host_rooms[room] != undefined && 
             host_rooms[room].flagStarGame === true )
          {
            console.log(room + " " + host_rooms[room].flagPing + " " + host_rooms[room].numPlayersInRoom)
            if((host_rooms[room].numPlayersInRoom === 2 && 
                 host_rooms[room].flagPing < 2) || 
               (host_rooms[room].numPlayersInRoom === 1 &&
                host_rooms[room].flagPing < 1))
            {
                io.sockets.to(room).emit('playerDisconnect', -1); 
                host_rooms[room] = undefined
            }
          }
        }
      }, 4000)

    }, 5000)

function onClientPong(gameId) {
  console.log("gameId " + gameId)
  host_rooms[gameId].flagPing += 1 

}

exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    
    gameSocket.emit('connected', { message: "You are connected!" });

    gameSocket.on('hostCreateNewGame', onHostCreateNewGame);
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('clickCell', onClickCell);
	  gameSocket.on('clickChatSend', onClickChatSend);
    gameSocket.on('clientPong', onClientPong);
    gameSocket.on('clientSkip', onClientSkip);
}

function onHostCreateNewGame(color, nickName) {
    var thisRoomId = uuid();
    let matrix = Object.assign({}, initField());
    //console.log(matrix)
	//console.log(color);
    //console.log("thisGameId = " + thisRoomId)

    host_rooms[thisRoomId] = {gameId: thisRoomId, numPlayersInRoom: 1, color: color, playersId: { [this.id] : { color: color, name: nickName, selectedPiece: null}}, 
      field: matrix, flagPing: 1, flagStarGame: false };

    //console.log("host_rooms = " + host_rooms[thisRoomId].gameId + ' ' + host_rooms[thisRoomId].numPlayersInRoom+ ' ' + host_rooms[thisRoomId].color+ ' ' + host_rooms[thisRoomId].playersId[this.id].color+ ' ' + host_rooms[thisRoomId].playersId[this.id].name)
    
    this.join(thisRoomId.toString());

    this.emit('newGameCreated', thisRoomId);//58

};

//Хнефатафл хомобишёси люзэтэрэ 2015!


function initField() {
    var matrix = [] // [{}]
    var mas_black = [[1,4],[1,5],[1,6],[1,7],[1,8],[2,6],
                     [11,4],[11,5],[11,6],[11,7],[11,8],[10,6]]
    var mas_white = [[4,6],
                     [5,5],[5,6],[5,7], 
                     [6,4],[6,5], [6,7], [6,8],
                     [7,5], [7,6], [7,7],
                     [8,6]];
    var center = [6,6]

    for (var i = 1; i <= 11; ++i) {
      matrix[i] = [{}]
    }
    //black
    for (var i = 0; i < mas_black.length; i++) {   
      
      matrix[mas_black[i][0]][mas_black[i][1]] = { type: 'b_pawn' }

      matrix[mas_black[i][1]][mas_black[i][0]] = { type: 'b_pawn' }
    }

    for (var i = 0; i < mas_white.length; i++) {   
      
      matrix[mas_white[i][0]][mas_white[i][1]] = { type: 'w_pawn' }
    }

    matrix[center[0]][center[1]] = { type: 'w_king' }


    return matrix
}


function playerJoinGame(data) {
    var sock = this;

    var room = gameSocket.adapter.rooms[data.gameId];

    if( room != undefined && host_rooms[data.gameId] != undefined){
        data.mySocketId = sock.id;
        
        host_rooms[data.gameId].numPlayersInRoom += 1

        if (host_rooms[data.gameId].numPlayersInRoom > 2)
        {
          this.emit('error1',{message: "This room is full."} );
        }
        else
        {
          sock.join(data.gameId);
        
          host_rooms[data.gameId].playersId[data.mySocketId] = { color: (host_rooms[data.gameId].color=="White"?"Black":"White"), name: data.playerName};
  	      console.log(host_rooms[data.gameId].color);
		      host_rooms[data.gameId].color = "White"          
          io.sockets.to(data.gameId).emit('playerJoinedRoom', data, { field: host_rooms[data.gameId].field, color: host_rooms[data.gameId].color}, host_rooms[data.gameId].playersId[data.mySocketId].color);      
          //24+576=600
          io.sockets.to(data.gameId).emit('updateStep', "White"); //26

          for(var i in host_rooms[data.gameId].playersId)
          {
            console.log(i)
            console.log(sizeof(host_rooms[data.gameId].playersId[i]))
          }

          host_rooms[data.gameId].flagStarGame = true
        }

    } else {
        this.emit('error1',{message: "This room does not exist."} );
    }
};

function uuid() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
};


function onClickCell(nameCell, gameId, coord) {
  
  var colorPiece = undefined
    
  for (var id in host_rooms[gameId].playersId )
      if (id == this.id)
      {
        
         if (nameCell == null) // krest
         {
            //2 hod
            if (host_rooms[gameId].playersId[this.id].selectedPiece != null)
            {
                //logica proverki hoda

                //Проверка хода
                if(coord[1]==host_rooms[gameId].playersId[this.id].selectedPiece.y || 
                 coord[0]==host_rooms[gameId].playersId[this.id].selectedPiece.x)
                {
                  let line
                  let numb
                  let flag = 0;

                  if (coord[1]==host_rooms[gameId].playersId[this.id].selectedPiece.y) 
                  {
                    line = "x"
                    numb = "0"
                  }
                  else
                  {
                    line = "y"
                    numb = "1"
                  }  
                  
                  if(Number(host_rooms[gameId].playersId[this.id].selectedPiece[line]) > Number(coord[numb]))
                  {
                    for (var i = Number(host_rooms[gameId].playersId[this.id].selectedPiece[line]) - 1;
                          i >= coord[numb] ; --i )
                    {
                      //console.log("Cycle >");
                      //field[1][2] -- 2 - stroka
                      if(line == "x")
                      {
                        if(host_rooms[gameId].field[i][coord[1]] != undefined)
                        {
                          flag = 1
                        }

                      }
                      else
                      {
                        if(host_rooms[gameId].field[coord[0]][i] != undefined)
                        {
                          flag = 1
                        }
                      }

                    }
                                     
                  }
                  else
                  {
                    for (var i = Number(host_rooms[gameId].playersId[this.id].selectedPiece[line]) + 1;
                          i <= coord[numb] ; ++i )
                    {
                      //console.log("Cycle <");
                       if(line == "x")
                      {
                        if(host_rooms[gameId].field[i][coord[1]] != undefined)
                        {
                          flag = 1
                        }

                      }
                      else
                      {
                        if(host_rooms[gameId].field[coord[0]][i] != undefined)
                        {
                          flag = 1
                        }
                      }
                    }
                  }

                  console.log (host_rooms[gameId].field
                    [host_rooms[gameId].playersId[this.id].selectedPiece.x]
                    [host_rooms[gameId].playersId[this.id].selectedPiece.y])

          //Проверка на угловые поля и на трон
				  if (host_rooms[gameId].field
                    [host_rooms[gameId].playersId[this.id].selectedPiece.x]
                    [host_rooms[gameId].playersId[this.id].selectedPiece.y] != undefined)
					{
						if ( (flag==0) && (host_rooms[gameId].field
							[host_rooms[gameId].playersId[this.id].selectedPiece.x]
							[host_rooms[gameId].playersId[this.id].selectedPiece.y].type != "w_king") &&
							((coord[0] == 1 && coord[1] == 1) || 
							(coord[0] == 11 && coord[1] == 11) ||
							(coord[0] == 1 && coord[1] == 11) ||
							(coord[0] == 11 && coord[1] == 1) ||
							(coord[0] == 6 && coord[1] == 6) ))
						{
							flag=1
						}
					}
                  
                  

                  if(flag==0)
                  {

					
                  host_rooms[gameId].field[coord[0]][coord[1]]=host_rooms[gameId].field
                  [host_rooms[gameId].playersId[this.id].selectedPiece.x]
                  [host_rooms[gameId].playersId[this.id].selectedPiece.y];

                  host_rooms[gameId].field
                  [host_rooms[gameId].playersId[this.id].selectedPiece.x]
                  [host_rooms[gameId].playersId[this.id].selectedPiece.y] = undefined;
                

        //logica ubiistv
				if ((host_rooms[gameId].field[coord[0]][coord[1]] != undefined) &&
					(host_rooms[gameId].field[coord[0]][coord[1]].type == "w_king") && 
                     ((coord[0] == 1 && coord[1] == 1) || 
                     (coord[0] == 11 && coord[1] == 11) ||
                     (coord[0] == 1 && coord[1] == 11) ||
                     (coord[0] == 11 && coord[1] == 1)) )
                  {
                    console.log("endGame")
                    io.sockets.to(gameId).emit('endGame', "белых");      
                    host_rooms[gameId] = undefined
                    console.log(host_rooms)                    
                    return;
                  }
				
				  //Обработка правил
				  
				   //Обработка любой фигуры фигуры
					  let cX = coord[0]
					  let cY = coord[1]
					  
					  //Проверка ячеек слева
					  if ((cX - 1 > 0) && (cX - 2 > 0)) //проверяем на границу
					  {
						  if ((host_rooms[gameId].field[cX-2][cY] != undefined || cX-2==6) &&
							  host_rooms[gameId].field[cX-1][cY] != undefined) //
						  {
							  if (host_rooms[gameId].field[cX-2][cY] != undefined) //если фигура
							  {
								  if ((host_rooms[gameId].field[cX][cY].type[0] == host_rooms[gameId].field[cX-2][cY].type[0]) &&
									 (host_rooms[gameId].field[cX][cY].type[0] != host_rooms[gameId].field[cX-1][cY].type[0]))
								  {
									  if(host_rooms[gameId].field[cX-1][cY].type == "w_king") //Если король
									  { 
									    //Обработка для короля на троне
									  	//host_rooms[gameId].field[cX-1][cY] = undefined
									  	if((Number(cY)+1 <= 11) && (cY-1 >= 1))
											if((host_rooms[gameId].field[cX-1][cY-1] != undefined 
												|| (cX-1 == 6 && cY-1 == 6)) &&
											   (host_rooms[gameId].field[cX-1][Number(cY)+1] != undefined
												|| (cX-1 == 6 && Number(cY)+1 == 6)))
											{
												if( host_rooms[gameId].field[cX-1][cY-1] != undefined &&
													host_rooms[gameId].field[cX-1][cY-1].type[0] == 'b' &&
												    host_rooms[gameId].field[cX-1][Number(cY)+1] != undefined &&
												    host_rooms[gameId].field[cX-1][Number(cY)+1].type[0] == 'b' ||
												    (cX-1 == 6 && cY-1 == 6) ||
												    (cX-1 == 6 && Number(cY)+1 == 6))
													{ 
														console.log("KOROL SDoH")
														host_rooms[gameId].field[cX-1][cY] = undefined
														io.sockets.to(gameId).emit('endGame', "черных");
														host_rooms[gameId] = undefined
									                    console.log(host_rooms)                    
									                    return;
													}

											}
									  } 
									  else
									  {console.log("KOROL neSDoH")
										 host_rooms[gameId].field[cX-1][cY] = undefined
									  }  
									  
								  }
											
							  }
							  else if((cX-2 == 6 && cY == 6) &&
								      (host_rooms[gameId].field[cX][cY].type[0] != host_rooms[gameId].field[cX-1][cY].type[0]))
							  	//если трон
							  {
									if(host_rooms[gameId].field[cX-1][cY].type != "w_king") //Если не король
									{ 
										host_rooms[gameId].field[cX-1][cY] = undefined
									} 
									else
									{
										//Если король
										if(host_rooms[gameId].field[cX-1][cY-1] != undefined &&
										   host_rooms[gameId].field[cX-1][Number(cY)+1] != undefined)
										{
											if( host_rooms[gameId].field[cX-1][cY-1].type[0] == 'b' &&
											    host_rooms[gameId].field[cX-1][Number(cY)+1].type[0] == 'b')
												{ 
													console.log("KOROL SDoH")
													host_rooms[gameId].field[cX-1][cY] = undefined
													io.sockets.to(gameId).emit('endGame', "черных");
													host_rooms[gameId] = undefined
									                console.log(host_rooms)                    
									                return;
												}
										}
									}
							  }
						  }
					  }
					  
					//Проверка ячеек сверху
					  if ((cY - 1 > 0) && (cY - 2 > 0)) 
					  {
						  if ((host_rooms[gameId].field[cX][cY-2] != undefined || cY-2==6) &&
							  host_rooms[gameId].field[cX][cY-1] != undefined)
						  {
							  if (host_rooms[gameId].field[cX][cY-2] != undefined)
							  {
								  if ((host_rooms[gameId].field[cX][cY].type[0] == host_rooms[gameId].field[cX][cY-2].type[0]) &&
									 (host_rooms[gameId].field[cX][cY].type[0] != host_rooms[gameId].field[cX][cY-1].type[0]))
								  {
									  if(host_rooms[gameId].field[cX][cY-1].type == "w_king") //Если король
									  { 
									    //Обработка для короля на троне
									  	//host_rooms[gameId].field[cX-1][cY] = undefined
									  	if((Number(cX)+1 <= 11) && (cX-1 >= 1))
											if((host_rooms[gameId].field[cX-1][cY-1] != undefined || 
												(cX-1 == 6 && cY-1 ==6)) &&
											   (host_rooms[gameId].field[Number(cX)+1][cY-1] != undefined || 
												(Number(cX)+1 == 6 && cY-1 ==6)))
											{
												if( host_rooms[gameId].field[cX-1][cY-1] != undefined &&
													host_rooms[gameId].field[cX-1][cY-1].type[0] == 'b' &&
													host_rooms[gameId].field[Number(cX)+1][cY-1] != undefined &&
												    host_rooms[gameId].field[Number(cX)+1][cY-1].type[0] == 'b' || 
												    (cX-1 == 6 && cY-1 ==6) || 
													(Number(cX)+1 == 6 && cY-1 ==6))
													{ 
														console.log("KOROL SDoH")
														host_rooms[gameId].field[cX][cY-1] = undefined
														io.sockets.to(gameId).emit('endGame', "черных");
														host_rooms[gameId] = undefined
									                    console.log(host_rooms)                    
									                    return;
													}
											}
									  } 
									  else
									  {console.log("KOROL neSDoH")
										 host_rooms[gameId].field[cX][cY-1] = undefined
									  }  
									  
								  }
											
							  }
							  else if((cY-2 == 6 && cX == 6) &&
								      (host_rooms[gameId].field[cX][cY].type[0] != host_rooms[gameId].field[cX][cY-1].type[0]))
							  {
									if(host_rooms[gameId].field[cX][cY-1].type != "w_king") //Если не король
									{ 
										host_rooms[gameId].field[cX][cY-1] = undefined
									} 
									else
									{
										//Если король
										if(host_rooms[gameId].field[cX-1][cY-1] != undefined &&
										   host_rooms[gameId].field[Number(cX)+1][cY-1] != undefined)
										{
											if( host_rooms[gameId].field[cX-1][cY-1].type[0] == 'b' &&
											    host_rooms[gameId].field[Number(cX)+1][cY-1].type[0] == 'b')
												{ 
													console.log("KOROL SDoH")
													host_rooms[gameId].field[cX][cY-1] = undefined
													io.sockets.to(gameId).emit('endGame', "черных");
													host_rooms[gameId] = undefined
									                console.log(host_rooms)                    
									                return;
												}
										}
									}
							  }
							  
						  }
					  }
					 
					 
					  //Проверка ячеек справа
					  if ((Number(cX) + 1 <= 11) && (Number(cX) + 2 <= 11)) 
					  {
						  if ((host_rooms[gameId].field[Number(cX)+2][cY] != undefined || Number(cX)+2==6 ) &&
							  host_rooms[gameId].field[Number(cX)+1][cY] != undefined)
						  {
							  if (host_rooms[gameId].field[Number(cX)+2][cY] != undefined)
							  {
								  if ((host_rooms[gameId].field[cX][cY].type[0] == host_rooms[gameId].field[Number(cX)+2][cY].type[0]) &&
									 (host_rooms[gameId].field[cX][cY].type[0] != host_rooms[gameId].field[Number(cX)+1][cY].type[0]))
								  {
									  if(host_rooms[gameId].field[Number(cX)+1][cY].type == "w_king" ) //Если король
									  { 
									    //Обработка для короля на троне
									  	//host_rooms[gameId].field[cX-1][cY] = undefined
									  	if((Number(cY)+1 <= 11) && (cY-1 >= 1))
										if((host_rooms[gameId].field[Number(cX)+1][cY-1] != undefined || 
												(Number(cX)+1 == 6 && cY-1 ==6)) &&
										   (host_rooms[gameId].field[Number(cX)+1][Number(cY)+1] != undefined || 
												(Number(cX)+1 == 6 && Number(cY)+1 ==6)))
										{
											if( host_rooms[gameId].field[Number(cX)+1][cY-1].type[0] != undefined &&
												host_rooms[gameId].field[Number(cX)+1][cY-1].type[0] == 'b' &&
												host_rooms[gameId].field[Number(cX)+1][Number(cY)+1] != undefined &&
											    host_rooms[gameId].field[Number(cX)+1][Number(cY)+1].type[0] == 'b' || 
												(Number(cX)+1 == 6 && cY-1 ==6) || 
												(Number(cX)+1 == 6 && Number(cY)+1 ==6))
												{ 
													console.log("KOROL SDoH")
													host_rooms[gameId].field[Number(cX)+1][cY] = undefined
													io.sockets.to(gameId).emit('endGame', "черных");
													host_rooms[gameId] = undefined
									                console.log(host_rooms)                    
									                return;
												}
										}
									  } 
									  else
									  {console.log("KOROL neSDoH")
										 host_rooms[gameId].field[Number(cX)+1][cY] = undefined
									  }  
									  
								  }
											
							  }
							  else if((Number(cX)+2 == 6 && cY == 6) &&
								      (host_rooms[gameId].field[cX][cY].type[0] != host_rooms[gameId].field[Number(cX)+1][cY].type[0]))
							  {
									if(host_rooms[gameId].field[Number(cX)+1][cY].type != "w_king") //Если не король
									{ 
										host_rooms[gameId].field[Number(cX)+1][cY] = undefined
									} 
									else
									{
										//Если король
										if(host_rooms[gameId].field[Number(cX)+1][cY-1] != undefined &&
										   host_rooms[gameId].field[Number(cX)+1][Number(cY)+1] != undefined)
										{
											if( host_rooms[gameId].field[Number(cX)+1][cY-1].type[0] == 'b' &&
											    host_rooms[gameId].field[Number(cX)+1][Number(cY)+1].type[0] == 'b')
												{ 
													console.log("KOROL SDoH")
													host_rooms[gameId].field[Number(cX)+1][cY] = undefined
													io.sockets.to(gameId).emit('endGame', "черных");
													host_rooms[gameId] = undefined
									                console.log(host_rooms)                    
									                return;
												}
										}
									}
							  }
							  
						  }
					  }
					  
					  //Проверка ячеек Снизу
					  if ((Number(cY) + 1 <= 11) && (Number(cY) + 2 <=11)) 
					  {
						  if ((host_rooms[gameId].field[cX][Number(cY)+2] != undefined || Number(cY)+2==6 ) &&
							  host_rooms[gameId].field[cX][Number(cY)+1] != undefined)
						  {
							  if (host_rooms[gameId].field[cX][Number(cY)+2] != undefined)
							  {
								  if ((host_rooms[gameId].field[cX][cY].type[0] == host_rooms[gameId].field[cX][Number(cY)+2].type[0]) &&
									 (host_rooms[gameId].field[cX][cY].type[0] != host_rooms[gameId].field[cX][Number(cY)+1].type[0]))
								  {
									  if(host_rooms[gameId].field[cX][Number(cY)+1].type == "w_king" ) //Если король
									  { 
									    //Обработка для короля на троне
									  	//host_rooms[gameId].field[cX-1][cY] = undefined
									  	if((Number(cX)+1 <= 11) && (cX-1 >= 1))
											if((host_rooms[gameId].field[cX-1][Number(cY)+1] != undefined || 
												(cX-1 == 6 && Number(cY)+1 ==6)) && 
											   (host_rooms[gameId].field[Number(cX)+1][Number(cY)+1] != undefined|| 
												(Number(cX)+1 == 6 && Number(cY)+1 ==6)))
											{
												if( host_rooms[gameId].field[cX-1][Number(cY)+1] != undefined &&
													host_rooms[gameId].field[cX-1][Number(cY)+1].type[0] == 'b' &&
													host_rooms[gameId].field[Number(cX)+1][Number(cY)+1] != undefined &&
												    host_rooms[gameId].field[Number(cX)+1][Number(cY)+1].type[0] == 'b' ||
												    (cX-1 == 6 && Number(cY)+1 ==6) ||
												    (Number(cX)+1 == 6 && Number(cY)+1 ==6))
													{ 
														console.log("KOROL SDoH")
														host_rooms[gameId].field[cX][Number(cY)+1] = undefined
														io.sockets.to(gameId).emit('endGame', "черных");
														host_rooms[gameId] = undefined
									                	console.log(host_rooms)                    
									                	return;
													}
											}
									  } 
									  else
									  {
									  	console.log("KOROL neSDoH")
										 host_rooms[gameId].field[cX][Number(cY)+1] = undefined
									  }  
									  
								  }
											
							  }
							  else if((Number(cY)+2 == 6 && cX == 6) &&
								      (host_rooms[gameId].field[cX][cY].type[0] != host_rooms[gameId].field[cX][Number(cY)+1].type[0]))
							  {
									if(host_rooms[gameId].field[cX][Number(cY)+1].type != "w_king") //Если не король
									{ 
										host_rooms[gameId].field[cX][Number(cY)+1] = undefined
									} 
									else
									{
										//Если король
										if(host_rooms[gameId].field[cX-1][Number(cY)+1] != undefined &&
										   host_rooms[gameId].field[Number(cX)+1][Number(cY)+1] != undefined)
										{
											if( host_rooms[gameId].field[cX-1][Number(cY)+1].type[0] == 'b' &&
											    host_rooms[gameId].field[Number(cX)+1][Number(cY)+1].type[0] == 'b')
												{ 
													console.log("KOROL SDoH")
													host_rooms[gameId].field[cX][NUmber(cY)+1] = undefined
													io.sockets.to(gameId).emit('endGame', "черных");
													host_rooms[gameId] = undefined
									                console.log(host_rooms)                    
									                return;
												}
										}
									}
							  }
							  
						  }
					  }
					 
					 
				  
				  
                  host_rooms[gameId].color == "Black" ? host_rooms[gameId].color = "White" : host_rooms[gameId].color = "Black"

                  io.sockets.to(gameId).emit('fieldChanged', {field: host_rooms[gameId].field, color: host_rooms[gameId].color});      
                  io.sockets.to(gameId).emit('updateStep', host_rooms[gameId].color);
                  }
                }
                else
                {
                  //console.log("")
                }
            }  
            else
            {
              //console.log("")
            }
         }
         else
         {
          //1 hod
              switch(nameCell) {
                case 9823: 
                //if (host_rooms[gameId].color == "Black" && )
                    colorPiece = "Black"
                break
                case 9817:  
                //if (host_rooms[gameId].color == "White")
                    colorPiece = "White"
                break
                case 9812:  
                //if (host_rooms[gameId].color == "White")
                    colorPiece = "White"
                break
                default:
                colorPiece = undefined
                break        
              }
            
              if (host_rooms[gameId].playersId[this.id].color == colorPiece) {   
                if (host_rooms[gameId].color == colorPiece)
                {               
                      host_rooms[gameId].playersId[this.id].selectedPiece = {x:coord[0] , y:coord[1]}
                      console.log( host_rooms[gameId].playersId[this.id].selectedPiece.x)
                      console.log( host_rooms[gameId].playersId[this.id].selectedPiece.y)
                }
                else
                {
                  host_rooms[gameId].playersId[this.id].selectedPiece = null  
                }
              } 
              else {
                  host_rooms[gameId].playersId[this.id].selectedPiece = null  
              }
         
        }
        
      }
}


function onClickChatSend(msg,gameId, color){
	io.sockets.to(gameId).emit('sendMsgChat', msg, color);
};

//Скип хода (холдиг более 15 секунд)
function onClientSkip(gameId, color){
  console.log("Skip " + gameId + " Color " + color)
    if (host_rooms != undefined && host_rooms[gameId] != undefined && 
      host_rooms[gameId].color==color)
    {
      host_rooms[gameId].color == "Black" ? host_rooms[gameId].color = "White" : host_rooms[gameId].color = "Black"
      io.sockets.to(gameId).emit('fieldChanged', {field: host_rooms[gameId].field, color: host_rooms[gameId].color});      
      io.sockets.to(gameId).emit('updateStep', host_rooms[gameId].color);
    } 
}

