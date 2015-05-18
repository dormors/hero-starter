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
  },
  
 // The "Simplet"
  // This hero will try help his nearby.
  simplet : function(gameData, helpers) {
    var myhero = gameData.activeHero;
    var hdirection='North'; // "Northerner" by default
    var hval = -1000; // heuristic
    var myDirection;
    var dft = myhero.distanceFromTop;
    var dfl = myhero.distanceFromLeft;
    var hstay=0;
    var hmv=0;
    var hmoves = {
      Stay: 0,
      North: 0,
      East: 0,
      South: 0,
      West: 0
    };
    var hlegalmoves = {
      North: 0,
      East: 0,
      South: 0,
      West: 0
    };

    var testNorth=helpers.getTileNearby(gameData.board, dft, dfl, 'North');
    if (testNorth)
    {
      if (testNorth.type === 'Impassable')
      {
	hdirection='Stay';
      }
    }
    else
    {
      hdirection='Stay';
    }

    // 1st pass
    for (myDirection in hlegalmoves) {
      var myNextTile = helpers.getTileNearby(gameData.board, dft, dfl, myDirection);
      if (myNextTile)
      {
	if (myNextTile.type === 'Impassable')
	{
	  hlegalmoves[myDirection]=1;
	}
	if (myNextTile.type === 'HealthWell')
	{
	  if (myhero.health < 100)
	  {
	    hmoves[myDirection] += Math.round((30 / myhero.health) * 100);
	  }
	}
	if (myNextTile.type === 'DiamondMine')
	{
	  if (myNextTile.owner)
	  {
	    if (myNextTile.owner.team !== myhero.team)
	    {
	      hmoves[myDirection] += 5;
	    }
	  }
	  else
	  {
	    if (myhero.health == 100)
	    {
	      hmoves[myDirection] += 3;
	    }
	    else
	    {
	      hmoves[myDirection] -= 3;
	    }
	  }
	}
	if (myNextTile.type === 'Hero')
	{
	  if (myNextTile.team !== myhero.team)
	  {
	    if (myNextTile.health <= 30)
	    {
	      if (myNextTile.health <= 20)
	      {
		hstay += 200;
	      }
	      else
	      {
		hmoves[myDirection] += 200;
	      }
	    }
	    else
	    {
	      hmoves[myDirection] += Math.round((10 / myNextTile.health) * 100);
	      hstay += Math.round((20 / myNextTile.health) * 100);
	      hstay -= Math.round((30 / (myhero.health - 20)) * 100);
	      hmv -= Math.round((20 / myhero.health) * 100);
	    }
	  }
	  else
	  {
	    hmoves[myDirection] += (100-myNextTile.health);
	  }
	}
	if ((myNextTile.type === 'Unoccupied') || (myNextTile.type === 'Bones'))
	{
	  var ntdft = myNextTile.distanceFromTop;
	  var ntdfl = myNextTile.distanceFromLeft;
	  for (var lDirection in hlegalmoves) {
	    var moveTile = helpers.getTileNearby(gameData.board, ntdft, ntdfl, lDirection);
	    if (moveTile)
	    {
	      if (moveTile.type === 'HealthWell')
	      {
		hmoves[myDirection] += Math.min(20,(100-myhero.health));
	      }
	      if (moveTile.type === 'DiamondMine')
	      {
		if (moveTile.owner)
		{
		  if (moveTile.owner.team !== myhero.team)
		  {
		    hmoves[myDirection] += 2;
		  }
		}
		else
		{
		  hmoves[myDirection] += 1;
		}
	      }
	      if (moveTile.type === 'Hero')
	      {
		if (moveTile.team !== myhero.team)
		{
		  if (moveTile.health <= 20)
		  {
		    hmoves[myDirection] += 200;
		  }
		  else
		  {
		    hmoves[myDirection] += Math.round((20 / (moveTile.health - 20)) * 100);
		    hmoves[myDirection] -= Math.round((30 / myhero.health) * 100);
		  }
		  hstay -= Math.round((10 / myhero.health) * 100);
		}
		else
		{
		  hmoves[myDirection] += Math.min(20,(100-moveTile.health));
		}
	      }
	    }
	  }
	}
	if (myNextTile.type === 'Bones')
	{
	  hmoves[myDirection] +=1;
	}
      }
      else
      {
	hlegalmoves[myDirection]=1;
      }
    }

    // 2nd pass
    for (myDirection in hlegalmoves) {
      var myNextTile = helpers.getTileNearby(gameData.board, dft, dfl, myDirection);
      if (myNextTile)
      {
	if ((myNextTile.type === 'Unoccupied') || (myNextTile.type === 'Bones'))
	{
	  hmoves[myDirection] +=hmv;
	}
	else 
	{
	  hmoves[myDirection] +=hstay;
	}
      }
    }
    hmoves['Stay'] += hstay;

    for (myDirection in hmoves) {
      if (hmoves[myDirection] > hval) {
	if (hlegalmoves[myDirection] == 0)
	{
	  hdirection = myDirection;
	  hval = hmoves[myDirection];
	}
      }
    }


    if ((hval == 0) && (myhero.health == 100))
    {
      var otherdirection=helpers.findNearestWeakerEnemy(gameData);

      if (!otherdirection)
      {
	otherdirection=helpers.findNearestTeamMember(gameData);
      }
      if (otherdirection)
      {
	hdirection=otherdirection;
      }
    }

    var hWell = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
      if (boardTile.type === 'HealthWell') {
        return true;
      }
    });
    var distanceToHealthWell = hWell.distance;
    var directionToHealthWell = hWell.direction;

    if (hWell)
    {
    	if ((hval < 50) && (myhero.health <= 60))
    	{
      	   hdirection=directionToHealthWell;
    	}

    	if (((hval <= 0) || (distanceToHealthWell==1)) && (myhero.health < 100))
    	{
      	    hdirection=directionToHealthWell;
    	}
    }

    return hdirection;
  }

 };

//  Set our heros strategy
var  move =  moves.simplet;

// Export the move function here
module.exports = move;
