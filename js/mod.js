let modInfo = {
	name: "The Layers Tree",
	id: "tmt_layers",
	author: "bumpy",
	pointsName: "progress",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1/6,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "First Edition",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added points, prestige points, power tiers, and super prestige points.<br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade('p', 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let mult = new Decimal(1)
	mult = mult.mul(buyableEffect('p', 11))
	mult = mult.mul(buyableEffect('p', 13))
	mult = mult.mul(buyableEffect('pr', 12))
	if (hasUpgrade('pr', 11)) mult = mult.mul(upgradeEffect('pr', 11))
	if (hasUpgrade('pr', 13)) mult = mult.mul(upgradeEffect('pr', 13))
	if (hasMilestone('pt', 0)) mult = mult.mul(new Decimal(1.5).pow(player.pt.points))
	if (hasUpgrade('spr', 42)) mult = mult.mul(upgradeEffect('spr', 42))
	if (hasUpgrade('spr', 51)) mult = mult.mul(upgradeEffect('spr', 51))
	
	if (hasUpgrade('spr', 11)) mult = mult.pow(upgradeEffect('spr', 11))
	return mult
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	"<span style='color:grey'>endgame: 30 total prestige tokens</span>"
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e3003"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
