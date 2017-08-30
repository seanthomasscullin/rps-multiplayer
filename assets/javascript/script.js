// Initialize Firebase
var config = {
    apiKey: "AIzaSyBnLRxXOz2INnCOC-XYYCKrlwk13TgU42g",
    authDomain: "rps-multiplayer-643a4.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-643a4.firebaseio.com",
    projectId: "rps-multiplayer-643a4",
    storageBucket: "",
    messagingSenderId: "669468271294"
  };
  firebase.initializeApp(config);

var database = firebase.database()

var numberOfPlayers = 0;
var playerNumber = 0;
var numberOfChats = 0;
var playerName = "";
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
var chats = database.ref('chat');
var players = database.ref('players');
var player1DB = database.ref('players/1')
var player2DB = database.ref('players/2')

var createMessage = function()
{
	var message = playerName+": "+$('#message').val().trim()
	database.ref('chat').child(numberOfChats).set(message)
}

connectedRef.on("value", function(snap) 
{
	console.log("console log of connections snap: "+snap)

	if (snap.val())
	{
		var con = connectionsRef.push(true);
		con.onDisconnect().remove();
		console.log("Player "+playerNumber+" has disconnected")
	}
});

player1DB.onDisconnect().remove();
player2DB.onDisconnect().remove();

connectionsRef.on("value", function(snap) 
{
	numberOfPlayers = snap.numChildren()
	console.log(numberOfPlayers)

	players.update(
	{
		numberOfConnections: numberOfPlayers
	})
});

chats.on('value', function(snap)
{
	numberOfChats = snap.numChildren();
})

players.on('value', function(snap)
{
	if (snap.numChildren() === 3)
	{
		$('#pick-name').hide();
		var player1Name = snap.val()[1].name;
		var player2Name = snap.val()[2].name;
		var player1Pick = snap.val()[1].pick
		var player2Pick = snap.val()[2].pick
		$('#player1-name').html(player1Name);
		$('#player2-name').html(player2Name);

		if (player1Pick === 'rock' || player1Pick === 'paper' || player1Pick === 'scissors')
		{
			$('#1-window').css('border', '4px solid lightgreen');
			$('#player1-name').html(player1Name+" has picked!");
			$('#choose-1').css('border', '4px solid lightgreen');
		}

		if (player2Pick === 'rock' || player2Pick === 'paper' || player2Pick === 'scissors')
		{
			$('#2-window').css('border', '4px solid lightgreen');
			$('#player2-name').html(player2Name+" has picked!");
			$('#choose-2').css('border', '4px solid lightgreen');
		}


		if (player1Pick!==undefined && player2Pick!==undefined && player1Pick!=='' && player2Pick!=='')
		{
			//If player 1 wins...
			if ((player1Pick === 'rock' && player2Pick === 'scissors') || (player1Pick === 'paper' && player2Pick === 'rock') || (player1Pick === 'scissors' && player2Pick ==='paper'))
			{
				var totalWins = snap.val()[1].wins + 1;
				var totalLosses = snap.val()[2].losses + 1;

 
				players.child(1).update(
				{
					wins: totalWins,
					pick: ''
				})

				players.child(2).update(
				{
					losses: totalLosses,
					pick: ''
				})

				$('#result').html(snap.val()[1].name+" Wins!")
				$('#player1-stats').html("Wins: "+totalWins+", Losses: "+snap.val()[1].losses)
				$('#player2-stats').html("Wins: "+snap.val()[2].wins+", Losses: "+totalLosses)

				$('#1-window').css('border', '4px solid #eee');
				$('#choose-1').css('border', '4px solid #eee');
				$('#2-window').css('border', '4px solid #eee');
				$('#choose-2').css('border', '4px solid #eee');
			}

			//If player 2 wins...
			else if ((player2Pick === 'rock' && player1Pick === 'scissors') || (player2Pick === 'paper' && player1Pick === 'rock') || (player2Pick === 'scissors' && player1Pick ==='paper'))
			{
				var totalWins = snap.val()[2].wins + 1;
				var totalLosses = snap.val()[1].losses + 1;

				players.child(2).update(
				{
					wins: totalWins,
					pick: ''
				})

				players.child(1).update(
				{
					losses: totalLosses,
					pick: ''
				})

				$('#result').html(snap.val()[2].name+" Wins!")
				$('#player1-stats').html("Wins: "+snap.val()[1].wins+", Losses: "+totalLosses)
				$('#player2-stats').html("Wins: "+totalWins+", Losses: "+snap.val()[2].losses)

				$('#1-window').css('border', '4px solid #eee');
				$('#choose-1').css('border', '4px solid #eee');
				$('#2-window').css('border', '4px solid #eee');
				$('#choose-2').css('border', '4px solid #eee');
			}

			//If there is a tie
			else if((player2Pick === 'rock' && player1Pick === 'rock') || (player2Pick === 'paper' && player1Pick === 'paper') || (player2Pick === 'scissors' && player1Pick ==='scissors'))
			{

				players.child(1).update(
				{
					pick: ''
				})

				players.child(2).update(
				{
					pick: ''
				})

				$('#result').html("Tie!")

				$('#1-window').css('border', '4px solid #eee');
				$('#choose-1').css('border', '4px solid #eee');
				$('#2-window').css('border', '4px solid #eee');
				$('#choose-2').css('border', '4px solid #eee');
			}
		}
	}

	console.log("Number of connections snap is: "+snap.val().numberOfConnections)

	if (snap.val().numberOfConnections === 1)
	{
		console.log("Someone logged out!")
		var whoIsIn = snap.val()
		database.ref('players').once('value').then(function(snap)
		{
			console.log(snap.val())
		});
	}

})

database.ref('numOfPlayers').once('value', function(snapshot)
{
	//Player number is able to identify which player!!! (as long as no one disconnects...)
	playerNumber = numberOfPlayers;
	console.log("This is player "+playerNumber)

	database.ref('numOfPlayers').set(
	{
		amountOfPlayers: numberOfPlayers
	})
})

database.ref('chat').on('value', function(snapshot)
{
	$('#chat-window').empty()

	for (var i=0; i<numberOfChats; i++)
	{
		var message = snapshot.val()[i]
		var p = $('<p>')
		p.html(message)
		$('#chat-window').append(p)
		$('#message').val("")
		$('#chat-window').scrollTop($('#chat-window')[0].scrollHeight);
	}

})

$('#create-player').on('click', function(event)
{
	playerName = $('#name').val().trim()

	database.ref('players').once('value').then(function(snap)
	{
		console.log("1 exists: "+snap.hasChild('1'))//true if exists, false if not
		console.log("2 exists: "+snap.hasChild('2'))//true if exists, false if not

		if (!snap.hasChild('1'))
		{
			database.ref('players').child('1').set(
			{
				wins: 0,
				losses: 0,
				name: playerName
			})

			$('#chat').show()
			$('#pick-name').hide()
			$('#1-window').hide()
			$('#choose-1').show()
			$('#player1-name-choose').html(playerName)
			$('#outcome').show()
			$('#2-window').show()
		}

		else if (!snap.hasChild('2'))
		{
			database.ref('players').child('2').set(
			{
				wins: 0,
				losses: 0,
				name: playerName
			})

			$('#chat').show()
			$('#pick-name').hide()
			$('#2-window').hide()
			$('#choose-2').show()
			$('#player2-name-choose').html(playerName)
			$('#outcome').show()
			$('#1-window').show()
		}
	});
})

$('#send-chat').on('click', function(event)
{
	createMessage()
})

$('#message').keyup(function(event)
{
	if (event.keyCode === 13)
	{
		createMessage()
	}
})

$('#rock1').on('click', function(event)
{
	players.child(1).update(
	{
		pick: 'rock'
	})
})

$('#scissors1').on('click', function(event)
{
	players.child(1).update(
	{
		pick: 'scissors'
	})	
})

$('#paper1').on('click', function(event)
{
	players.child(1).update(
	{
		pick: 'paper'
	})	
})

$('#rock2').on('click', function(event)
{
	players.child(2).update(
	{
		pick: 'rock'
	})
})

$('#scissors2').on('click', function(event)
{
	players.child(2).update(
	{
		pick: 'scissors'
	})	
})

$('#paper2').on('click', function(event)
{
	players.child(2).update(
	{
		pick: 'paper'
	})	
})