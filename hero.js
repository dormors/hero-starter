/*

  Strategies for the hero are contained within the "moves" object as
  name-value pairs, like so:

    //...
    ambusher : function(gamedData, helpers){
      // implementation of strategy.
    },
    heWhoLivesToFightAnotherDay: function(gamedData, helpers){
      // implementation of strategy.
    },
    //...other strategy definitions.

  The "moves" object only contains the data, but in order for a specific
  strategy to be implemented we MUST set the "move" variable to a
  definite property.  This is done like so:

  move = moves.heWhoLivesToFightAnotherDay;

  You MUST also export the move function, in order for your code to run
  So, at the bottom of this code, keep the line that says:

  module.exports = move;

  The "move" function must return "North", "South", "East", "West", or "Stay"
  (Anything else will be interpreted by the game as "Stay")

  The "move" function should accept two arguments that the website will be passing in:
    - a "gameData" object which holds all information about the current state
      of the battle

    - a "helpers" object, which contains useful helper functions
      - check out the helpers.js file to see what is available to you

    (the details of these objects can be found on javascriptbattle.com/#rules)

  Such is the power of Javascript!!!

*/

// Strategy definitions
var moves = {
  // Aggressor
  aggressor: function(gameData, helpers) {
    // Here, we ask if your hero's health is below 30
    if (gameData.activeHero.health <= 30){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go attack someone...anyone.
      return helpers.findNearestEnemy(gameData);
    }
  },

  // Health Nut
  healthNut:  function(gameData, helpers) {
    // Here, we ask if your hero's health is below 75
    if (gameData.activeHero.health <= 75){
      // If it is, head towards the nearest health well
      return helpers.findNearestHealthWell(gameData);
    } else {
      // Otherwise, go mine some diamonds!!!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // Balanced
  balanced: function(gameData, helpers){
    //FIXME : fix;
    return null;
  },

  // The "Northerner"
  // This hero will walk North.  Always.
  northener : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    return 'North';
  },

  // The "Blind Man"
  // This hero will walk in a random direction each turn.
  blindMan : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    var choices = ['North', 'South', 'East', 'West'];
    return choices[Math.floor(Math.random()*4)];
  },

  // The "Priest"
  // This hero will heal nearby friendly champions.
  priest : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 60) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestTeamMember(gameData);
    }
  },

  // The "Unwise Assassin"
  // This hero will attempt to kill the closest enemy hero. No matter what.
  unwiseAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 30) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestEnemy(gameData);
    }
  },

  // The "Careful Assassin"
  // This hero will attempt to kill the closest weaker enemy hero.
  carefulAssassin : function(gameData, helpers) {
    var myHero = gameData.activeHero;
    if (myHero.health < 50) {
      return helpers.findNearestHealthWell(gameData);
    } else {
      return helpers.findNearestWeakerEnemy(gameData);
    }
  },

  // The "Safe Diamond Miner"
  // This hero will attempt to capture enemy diamond mines.
  safeDiamondMiner : function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });
    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestNonTeamDiamondMine(gameData);
    }
  },

  // The "Selfish Diamond Miner"
  // This hero will attempt to capture diamond mines (even those owned by teammates).
  selfishDiamondMiner :function(gameData, helpers) {
    var myHero = gameData.activeHero;

    //Get stats on the nearest health well
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });

    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (myHero.health < 40) {
      //Heal no matter what if low health
      return directionToHealthWell;
    } else if (myHero.health < 100 && distanceToHealthWell === 1) {
      //Heal if you aren't full health and are close to a health well already
      return directionToHealthWell;
    } else {
      //If healthy, go capture a diamond mine!
      return helpers.findNearestUnownedDiamondMine(gameData);
    }
  },

  // The "Coward"
  // This hero will try really hard not to die.
  coward : function(gameData, helpers) {
    return helpers.findNearestHealthWell(gameData);
  }
  
    // The "Simplet"
  // This hero will try help his nearby.
  simplet : function(gameData, helpers) {
    var hero = gameData.activeHero;
    var hdirection='North'; // "Northerner" by default
    var hval = -1000; // heuristic
    var direction;
    var dft = hero.distanceFromTop;
    var dfl = hero.distanceFromLeft;
    var directions = ['North', 'East', 'South', 'West'];
    var hstay=0;
    var hmv=0;
    var hmoves = {
      Stay: -1,
      North: 0,
      East: 0,
      South: 0,
      West: 0
    }; 


    // 1st pass
    for (direction in directions) {
      var nextTile = helpers.getTileNearby(board, dft, dfl, direction);
      if (nextTile)
      {
	if (nextTile.type === 'HealthWell')
	{
	  hmoves[direction] += Math.min(30,(100-hero.health));
	}
	if (nextTile.type === 'DiamondMine')
	{
	  if (nextTile.owner.team !== hero.team)
	  {
	    hmoves[direction] += 5;
	  }
	}
	if (nextTile.type === 'Hero')
	{
	  if (nextTile.team !== hero.team)
	  {
	    if (nextTile.health <= 30)
	    {
	      if (nextTile.health <= 20)
	      {
		hstay += 200;
	      }
	      else
	      {
		hmoves[direction] += 200;
	      }
	    }
	    else
	    {
	      hmoves[direction] += Math.round((10 / nextTile.health) * 100);
	      hstay += Math.round((20 / nextTile.health) * 100);
	      hstay -= Math.round((30 / hero.health) * 100);
	      hmv -= Math.round((20 / hero.health) * 100);
	    }
	  }
	  else
	  {
	    hmoves[direction] += Math.min(40,(100-nextTile.health));
	  }
	}
	if ((nextTile.type === 'Unoccupied') || (nextTile.type === 'Bones'))
	{
	  var ntdft = nextTile.distanceFromTop;
	  var ntdfl = nextTile.distanceFromLeft;
	  for (var mdirection in directions) {
	    var moveTile = helpers.getTileNearby(board, ntdft, ntdfl, mdirection);
	    if (moveTile)
	    {
	      if (moveTile.type === 'HealthWell')
	      {
		hmoves[direction] += Math.min(20,(100-hero.health));
	      }
	      if (moveTile.type === 'DiamondMine')
	      {
		if (moveTile.owner.team !== hero.team)
		{
		  hmoves[direction] += 1;
		}
	      }
	      if (moveTile.type === 'Hero')
	      {
		if (moveTile.team !== hero.team)
		{
		  if (moveTile.health <= 20)
		  {
		    hmoves[direction] += 200;
		  }
		  else
		  {
		    hmoves[direction] += Math.round((20 / (moveTile.health - 20)) * 100);
		    hmoves[direction] -= Math.round((30 / hero.health) * 100);
		  }
		  hstay -= Math.round((20 / hero.health) * 100);
		}
		else
		{
		  hmoves[direction] += Math.min(10,(100-moveTile.health));
		}
	      }
	    }
	  }
	}
	if (nextTile.type === 'Bones')
	{
	  hmoves[direction] +=1;
	}
      }

    // 2nd pass
    for (direction in directions) {
      var nextTile = helpers.getTileNearby(board, dft, dfl, direction);
      if (nextTile)
      {
	if ((nextTile.type === 'Unoccupied') || (nextTile.type === 'Bones'))
	{
	  hmoves[direction] +=hmv;
	}
	else 
	{
	  hmoves[direction] +=hstay;
	}
      }
    }

    for (direction in hmoves) {
      if (hmoves[direction] > hval) {
        hdirection = direction;
        hval = hmoves[direction];
      }
    }
    return hdirection;
  }
 };

//  Set our heros strategy
var  move =  moves.simplet;

// Export the move function here
module.exports = move;
