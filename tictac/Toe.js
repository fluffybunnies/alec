

Toe = function($cont, opts){
  var z = this;
  z.$ = {
    cont: $cont
  };
  // opts are options specific to an instance
  z.opts = $.extend(true,{},z.config.defaults,opts);
  z.squares = [];

  z.build();
  z.functionalize();
  z.startGame();
}

// these are options global to all instances
Toe.prototype.config = {
  key: 'Toe'
  ,defaults: {
    title: 'Tic Tac Toe'
  }
  ,firstPlayer: 'x'
  ,squareVals: [1,2,4,8,16,32,64,128,256]
  ,winDefs: [7,56,73,84,146,273,292,448]
}

Toe.prototype.build = function(){
  var z = this
    ,x = z.config.key
    ,square,i
  ;

  z.$.cont.addClass(x);
  z.$.cont.html(
    (z.opts.title ? '<div class="'+x+'-title">'+z.opts.title+'</div>' : '')
    + '<div class="'+x+'-player_turn"></div>'
    + '<div class="'+x+'-board"></div>'
    + '<div class="'+x+'-actions"></div>'
  );
  z.$.playerTurn = z.$.cont.find('div.'+x+'-player_turn');
  z.$.board = z.$.cont.find('div.'+x+'-board');

  for (i=0;i<9;++i) {
    square = {
      $: {
        cont: $('<div class="'+x+'-square index-'+i+'" xdata-index="'+i+'"></div>')
      }
    };
    z.$.board.append(square.$.cont);
    z.squares.push(square);
  }

}

Toe.prototype.functionalize = function(){
  var z = this
    ,x = z.config.key
  ;

  z.$.board.find('div.'+x+'-square').bind('click',function(e){
    e.preventDefault();
    z.placeToken(+$(this).attr('xdata-index'));
  });
}

Toe.prototype.startGame = function(){
  var z = this;
  z.resetSquares();
  z.setPlayerTurn(z.config.firstPlayer);
  z.currentMove = 0;
  z.scores = {o:0, x:0};
  z.gameActive = true;
}

Toe.prototype.resetSquares = function(){
  var z = this;
  $.each(z.squares,function(i,square){
    square.token = null;
    square.$.cont.removeClass('is-on is-on-o is-on-x');
  });
}

Toe.prototype.placeToken = function(i){
  var z = this
    ,square = z.squares[i]
  ;
  if (!z.gameActive)
    return;
  if (square.token !== null)
    return;
  square.token = z.playerTurn;
  square.$.cont.addClass('is-on is-on-'+square.token);

  z.scores[z.playerTurn] += z.config.squareVals[i];
  ++z.currentMove;

  if (!z.checkForGameOver())
    z.setPlayerTurn( z.playerTurn == 'o' ? 'x' : 'o' );
}

Toe.prototype.setPlayerTurn = function(playerTurn){
  var z = this;
  z.playerTurn = playerTurn;
  z.$.playerTurn.html('It\'s ' + z.playerName(z.playerTurn) + '\'s turn!');
}

Toe.prototype.checkForGameOver = function(){
  var z = this
    ,winner
  ;

  if (checkWin(z.scores.o))
    winner = 'o';
  else if (checkWin(z.scores.x))
    winner = 'x';
  else if (z.currentMove == 9)
    winner = null;

  if (winner || winner === null) {
    z.gameActive = false;
    if (winner === null)
      alert('meeeeoooooowww');
    else
      alert(z.playerName(winner)+' has won!');
    setTimeout(function(){
      z.startGame();
    },0);
    return true;
  }
  return false;

  function checkWin(score){
    var i;
    for (i=0;i<z.config.winDefs.length;++i) {
      if ((z.config.winDefs[i] & score) == z.config.winDefs[i])
        return true;
    }
    return false;
  }
}

Toe.prototype.playerName = function(player){
  return player.toUpperCase();
}



