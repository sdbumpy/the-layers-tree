addLayer("p", {
    name: "points",
    symbol: "p",
    position: 0,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#80ffff",
    requires: new Decimal(10),
    resource: "points",
    baseResource: "progress",
    baseAmount() {return player.points},
    type: "normal",
    exponent: 0.5,
    gainMult() {
        mult = new Decimal(1)
		mult = mult.mul(buyableEffect('p', 12))
		mult = mult.mul(buyableEffect('pr', 13))
		if (hasMilestone('pt', 0)) mult = mult.mul(new Decimal(1.5).pow(player.pt.points))
		if (hasUpgrade('spr', 53)) mult = mult.mul(upgradeEffect('spr', 53))
        return mult
    },
    gainExp() {
        mult = new Decimal(1)
		if (hasUpgrade('spr', 43)) mult = mult.mul(upgradeEffect('spr', 43))
        return mult
    },
	buyables: {
		11: {
        	title: "active bonus",
			cost(x) {
				superpower = 0.1
				if (hasUpgrade('spr', 31)) {superpower *= 0.8;}
				return new Decimal(2).pow(new Decimal(new Decimal(1+superpower).pow(x).sub(1)).div(superpower)).div(buyableEffect('pr', 11)).floor()
			},
        	display() { return "×1.5 progress<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: ×"+format(buyableEffect(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" points" },
        	canAfford() { return player[this.layer].points.gte(this.cost()) },
        	buy() {
            	player[this.layer].points = player[this.layer].points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	},
			unlocked() {return hasUpgrade('p', 12)},
			effect(x) {
				effectiveAmount = x;
				if (hasUpgrade('spr', 51)) {effectiveAmount = effectiveAmount.add(player.spr.total_tokens.div(4));}
				return new Decimal(1.5).pow(effectiveAmount)
			},
		},
		12: {
        	title: "idle bonus",
			cost(x) {
				superpower = 0.1
				if (hasUpgrade('spr', 31)) {superpower *= 0.8}
				return new Decimal(2).pow(new Decimal(new Decimal(1+superpower).pow(x).sub(1)).div(superpower)).mul(20).div(buyableEffect('pr', 11)).floor()
			},
        	display() { return "×1.5 points<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: ×"+format(buyableEffect(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" progress" },
        	canAfford() { return player.points.gte(this.cost()) },
        	buy() {
            	player.points = player.points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	},
			unlocked() {return hasUpgrade('p', 12)},
			effect(x) {
				effectiveAmount = x;
				if (hasUpgrade('spr', 53)) {effectiveAmount = effectiveAmount.add(player.spr.total_tokens.div(4));}
				return new Decimal(1.5).pow(effectiveAmount)
			},
		},
		13: {
        	title: "scaling bonus",
			cost(x) { return new Decimal(6).pow(new Decimal(new Decimal(1.1).pow(x).sub(1)).div(0.1)).mul(50).floor() },
        	display() { return "×log10(progress+1)+1 progress<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: ×"+format(buyableEffect(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" points" },
        	canAfford() { return player[this.layer].points.gte(this.cost()) },
        	buy() {
            	player[this.layer].points = player[this.layer].points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	},
			unlocked() {return hasUpgrade('p', 13)},
			effect(x) {
				if (hasUpgrade('spr', 32)) x = x.add(1)
				mult = player.points.add(1).log(10).add(1).pow(x)
				if (hasUpgrade('pr', 12)) mult = mult.pow(upgradeEffect('pr', 12))
				return mult
			},
		},
	},
	upgrades: {
		11: {
			title: "begin making progress",
			description: "^",
			cost: new Decimal(1),
		},
		12: {
			title: "upgrades are overrated",
			description: "unlock two buyables",
			cost: new Decimal(1),
			unlocked() {return hasUpgrade('p', 11)},
		},
		13: {
			title: "loganomial growth",
			description: "unlock one buyable",
			cost: new Decimal(100),
			unlocked() {return hasUpgrade('p', 12)},
		},
	},
	milestones: {
    	0: {
        	requirementDescription: "100,000,000 points",
        	effectDescription: "unlock a new layer",
        	done() { return player.p.points.gte(1e8) },
    	},
    	1: {
        	requirementDescription: "1e12 points",
        	effectDescription: "unlock a new reset",
        	done() { return player.p.points.gte(1e12) },
		},
	},
	tabFormat: {
		"Main": {
			content: [
				"main-display",
    			"prestige-button",
				["display-text",
					function() { return 'You have ' + format(player.points) + ' progress' },
					{}],
				"blank",
    			"milestones",
				"blank",
    			"buyables",
    			"upgrades",
			],
		},
	},
    row: 0,
    hotkeys: [
        {key: "p", description: "P: Reset for points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	branches: [["pr", "#ffffff", 8], ["pt", "#ffffff", 8]],
	passiveGeneration() {
		if (hasUpgrade('spr', 21)) {
			tokenEffect = upgradeEffect('spr', 21)
			if (tokenEffect.gte(1000)) {
				return 10
			} else {
				return tokenEffect.div(100).toNumber()
			}
		}
	},
	automate() {
		if (hasUpgrade('spr', 41)) {
			if (hasUpgrade('p', 12)) {
				s = player[this.layer].points
				a = new Decimal(1).div(buyableEffect('pr', 11))
				m = new Decimal(2)
				r = 0.1
				if (hasUpgrade('spr', 31)) r *= 0.8
				r = new Decimal(r+1)
				n = s.div(a).ln().mul(r.sub(1)).div(m.ln()).add(1).ln().div(r.ln()).add(1)
				if (n.floor().gt(getBuyableAmount('p', 11))) setBuyableAmount('p', 11, n.floor())
				s = player.points
				a = new Decimal(20).div(buyableEffect('pr', 11))
				n = s.div(a).ln().mul(r.sub(1)).div(m.ln()).add(1).ln().div(r.ln()).add(1)
				if (n.floor().gt(getBuyableAmount('p', 12))) setBuyableAmount('p', 12, n.floor())
			}
			if (hasUpgrade('p', 13)) {
				s = player[this.layer].points
				a = new Decimal(50)
				m = new Decimal(6)
				r = 0.1
				r = new Decimal(r+1)
				n = s.div(a).ln().mul(r.sub(1)).div(m.ln()).add(1).ln().div(r.ln()).add(1)
				if (n.floor().gt(getBuyableAmount('p', 13))) setBuyableAmount('p', 13, n.floor())
			}
		} else if (player.pt.autoPointBuyables === true) {
			if (hasUpgrade('p', 12)) {
				superpower = 0.1
				if (hasUpgrade('spr', 31)) superpower *= 0.8
				price = new Decimal(2).pow(new Decimal(new Decimal(superpower+1).pow(getBuyableAmount('p', 11)).sub(1)).div(superpower)).div(buyableEffect('pr', 11)).floor()
				if (player[this.layer].points.gte(price)) {
					player[this.layer].points = player[this.layer].points.sub(price)
					addBuyables('p', 11, new Decimal(1))
				}
				superpower = 0.1
				if (hasUpgrade('spr', 31)) superpower *= 0.8
				price = new Decimal(2).pow(new Decimal(new Decimal(superpower+1).pow(getBuyableAmount('p', 12)).sub(1)).div(superpower)).mul(20).div(buyableEffect('pr', 11)).floor()
				if (player.points.gte(price)) {
					player.points = player.points.sub(price)
					addBuyables('p', 12, new Decimal(1))
				}
				superpower = 0.1
				if (hasUpgrade('spr', 31)) superpower *= 0.8
				price = new Decimal(6).pow(new Decimal(new Decimal(superpower+1).pow(getBuyableAmount('p', 13)).sub(1)).div(superpower)).mul(50).floor()
				if (player[this.layer].points.gte(price)) {
					player[this.layer].points = player[this.layer].points.sub(price)
					addBuyables('p', 13, new Decimal(1))
				}
			}
		}
		if (player.pt.autoPointUpgrades === true) {
			buyUpgrade('p', 11)
			buyUpgrade('p', 12)
			buyUpgrade('p', 13)
		}
	},
    layerShown(){return true},
	doReset(resettingLayer) {
		let keep = [];
		keep.push("milestones")
		if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
	},
})
addLayer("pr", {
    name: "prestige",
    symbol: "P",
    position: 0,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		tokens: new Decimal(0),
    }},
    color: "#80dfff",
    requires: new Decimal(1e8),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() {return player.p.points},
    type: "normal",
    exponent: 1/3,
    gainMult() {
        mult = new Decimal(1)
		if (hasMilestone('pt', 1)) mult = mult.mul(player.pt.points.mul(0.25).add(0.5))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
	buyables: {
		11: {
        	title: "reducer",
			cost(x) { return new Decimal(2).pow(new Decimal(new Decimal(1.075).pow(x).sub(1)).div(0.075)).floor()},
        	display() { return "/2 active and idle bonus prices<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: /"+format(buyableEffect(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" prestige points" },
        	canAfford() { return player[this.layer].points.gte(this.cost()) },
        	buy() {
            	player[this.layer].points = player[this.layer].points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	},
			unlocked() {return hasUpgrade('pr', 11)},
			effect(x) {return new Decimal(2).pow(x)},
		},
		12: {
        	title: "idle pusher",
			cost(x) { return new Decimal(3).pow(new Decimal(new Decimal(1.05).pow(x).sub(1)).div(0.05)).mul(1e15).floor()},
        	display() { return "×1.15 progress<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: ×"+format(buyableEffect(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" progress" },
        	canAfford() { return player.points.gte(this.cost()) },
        	buy() {
            	player.points = player.points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	},
			unlocked() {return hasUpgrade('pr', 14)},
			effect(x) {return new Decimal(1.15).pow(x)},
		},
		13: {
        	title: "active pusher",
			cost(x) { return new Decimal(2.5).pow(new Decimal(new Decimal(1.05).pow(x).sub(1)).div(0.05)).mul(1e5).floor()},
        	display() { return "×1.5 points<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: ×"+format(buyableEffect(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" prestige points" },
        	canAfford() { return player[this.layer].points.gte(this.cost()) },
        	buy() {
            	player[this.layer].points = player[this.layer].points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        	},
			unlocked() {return hasMilestone('pt', 3)},
			effect(x) {return new Decimal(1.5).pow(x)},
		},
	},
	upgrades: {
		11: {
			title: "acceleration",
			description: "×3 progress; unlock a prestige point buyable",
			cost: new Decimal(1),
			effect() {return new Decimal(3)},
		},
		12: {
			title: "get this now or layer",
			description: "^1.05 scaling bonus effect",
			cost: new Decimal(2),
			effect() {return new Decimal(1.05)},
			unlocked() {return hasUpgrade('pr', 11)},
		},
		13: {
			title: "actually useful prestige",
			description: "prestige points boosts progress",
			cost: new Decimal(4),
			unlocked() {return hasUpgrade('pr', 12)},
			effect() {return player.pr.points.add(1).root(3)},
			effectDisplay() { return "×"+format(upgradeEffect(this.layer, this.id)) },
		},
		14: {
			title: "idle power",
			description: "unlock a buyable",
			cost: new Decimal(30),
			unlocked() {return hasUpgrade('pr', 13)},
		},
	},
	milestones: {
    	0: {
        	requirementDescription: "10,000,000 prestige points",
        	effectDescription: "unlock a new layer",
        	done() { return player.pr.points.gte(1e7) },
    	},
	},
	tabFormat: {
		"Main": {
			content: [
				"main-display",
    			"prestige-button",
				["display-text",
					function() { return 'You have ' + format(player.p.points) + ' points' },
					{}],
				"blank",
    			"milestones",
				"blank",
    			"buyables",
    			"upgrades",
			],
		},
	},
    row: 1,
    hotkeys: [
        {key: "r", description: "R: Reset for prestige", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
	branches: [["spr", "#ffffff", 8]],
    layerShown(){return hasMilestone('p', 0)},
	doReset(resettingLayer) {
		let keep = [];
		keep.push("milestones")
		if (layers[resettingLayer].row > this.row) layerDataReset("pr", keep)
	},
})
addLayer("pt", {
    name: "powertier",
    symbol: "PT",
    position: 1,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		autoPointBuyables: false,
		autoPointUpgrades: false,
    }},
    color: "#ffffff",
    requires: new Decimal(1e12),
    resource: "power tier",
    baseResource: "points",
    baseAmount() {return player.p.points},
    type: "static",
    base: new Decimal(10),
    exponent: 1.125,
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
	buyables: {
		
	},
	upgrades: {
		
	},
	milestones: {
    	0: {
        	requirementDescription: "1 power tier",
        	effectDescription: "×1.5 progress and points per power tier",
        	done() { return player.pt.points.gte(1) },
    	},
    	1: {
        	requirementDescription: "3 power tiers",
        	effectDescription: "+25% prestige points per power tier starting at 3",
        	done() { return player.pt.points.gte(3) },
		},
    	2: {
        	requirementDescription: "5 power tiers",
        	effectDescription: "automatically buy buyables in the point tab",
        	done() { return player.pt.points.gte(5) },
			toggles: [['pt', 'autoPointBuyables']],
		},
    	3: {
        	requirementDescription: "8 power tiers",
        	effectDescription: "unlock a buyable in the prestige point tab",
        	done() { return player.pt.points.gte(8) },
		},
    	4: {
        	requirementDescription: "10 power tiers",
        	effectDescription: "automatically buy the first three upgrades in the point tab",
        	done() { return player.pt.points.gte(10) },
			toggles: [['pt', 'autoPointUpgrades']],
		},
	},
	tabFormat: {
		"Main": {
			content: [
				"main-display",
    			"prestige-button",
				["display-text",
					function() { return 'You have ' + format(player.p.points) + ' points' },
					{}],
				"blank",
    			"milestones",
				"blank",
    			"buyables",
    			"upgrades",
			],
		},
	},
    row: 1,
    hotkeys: [
        {key: "t", description: "T: Reset for power tier", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('p', 1)}
})
addLayer("spr", {
    name: "superprestige",
    symbol: "SP",
    position: 0,
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
		total: new Decimal(0),
		total_tokens: new Decimal(0),
		tokens: new Decimal(0),
    }},
    color: "#80bfff",
    requires: new Decimal(1e7),
    resource: "super prestige points",
    baseResource: "prestige points",
    baseAmount() {return player.pr.points},
    type: "normal",
    exponent: 1/5,
    gainMult() {
        mult = new Decimal(1)
		if (hasUpgrade('spr', 52)) mult = mult.mul(upgradeEffect('spr', 52))
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
	buyables: {
		11: {
        	title: "basic token pool",
			cost(x) { return new Decimal(10).pow(x.add(1).pow(1.5)).mul(10) },
        	display() { return "+1 prestige token<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: +"+format(getBuyableAmount(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" points" },
        	canAfford() { return player.p.points.gte(this.cost()) },
        	buy() {
            	player.p.points = player.p.points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            	player.spr.tokens = player.spr.tokens.add(1)
        	},
			unlocked() {return hasUpgrade('spr', 11)},
		},
		12: {
        	title: "prestigious token pool",
			cost(x) { return new Decimal(4).pow(x.pow(1.3)) },
        	display() { return "+1 prestige token<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: +"+format(getBuyableAmount(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" prestige points" },
        	canAfford() { return player.pr.points.gte(this.cost()) },
        	buy() {
            	player.pr.points = player.pr.points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            	player.spr.tokens = player.spr.tokens.add(1)
        	},
			unlocked() {return hasUpgrade('spr', 11)},
		},
		13: {
        	title: "super prestigious token pool",
			cost(x) { return new Decimal(3).pow(x) },
        	display() { return "+1 prestige token<br>"+format(getBuyableAmount(this.layer, this.id))+" → Currently: +"+format(getBuyableAmount(this.layer, this.id))+"<br>Cost: "+format(this.cost())+" super prestige points" },
        	canAfford() { return player.spr.points.gte(this.cost()) },
        	buy() {
            	player.spr.points = player.spr.points.sub(this.cost())
            	setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            	player.spr.tokens = player.spr.tokens.add(1)
        	},
			unlocked() {return hasUpgrade('spr', 11)},
		},
	},
	upgrades: {
		11: {
			title: "inflation be gone!",
			description: "^0.75 progress, but unlock three buyables",
			cost: new Decimal(1),
			effect() {
				if (hasUpgrade("spr", 14)) {
					return new Decimal(1);
				} else {return new Decimal(0.75);}
			},
		},
		12: {
			title: "a multiplier for your troubles",
			description: "×5 progress",
			cost: new Decimal(10),
			effect() {return new Decimal(5)},
			unlocked() {return hasUpgrade('spr', 11)},
		},
		13: {
			title: "stable pools",
			description: "keep all prestige tokens and token tree upgrades on super prestige",
			cost: new Decimal(1e3),
			unlocked() {return hasUpgrade('spr', 12)},
		},
		14: {
			title: "rebuilt",
			description: "disable the first super prestige upgrades's first effect",
			cost: new Decimal(1e6),
			unlocked() {return hasUpgrade('spr', 13)},
		},
		21: {
			title: "no more losing progress",
			description: "generate % of points on reset every second based on total prestige tokens (capped at 1,000%)",
			cost: new Decimal(1),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			effect() {
				num = getBuyableAmount('spr', 11).add(getBuyableAmount('spr', 12).add(getBuyableAmount('spr', 13))).pow(1.3).mul(15);
				if (num.gte(new Decimal(1000))) {return new Decimal(1000);}
				else {return num;}
			},
			effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"%" },
			unlocked() {return hasUpgrade('spr', 11)},
			branches: [[31, "#ffffff", 8], [32, "#ffffff", 8]],
		},
		31: {
			title: "unscaler",
			description: "-20% superexponential scaling strength of the first and second point buyables",
			cost: new Decimal(1),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 21)},
			branches: [[41, "#ffffff", 8]],
		},
		32: {
			title: "extra logonomial",
			description: "+1 free level for the third point buyable",
			cost: new Decimal(2),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 21)},
			branches: [[42, "#ffffff", 8],[43, "#ffffff", 8]],
		},
		41: {
			title: "no more wasting progress",
			description: "point buyables no longer spend resources, and are autobought",
			cost: new Decimal(2),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 31)},
			branches: [[52, "#ffffff", 8]],
		},
		42: {
			title: "faster",
			description: "×30 progress",
			cost: new Decimal(2),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			effect() {return new Decimal(30)},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 32)},
			branches: [[52, "#ffffff", 8]],
		},
		43: {
			title: "stronger",
			description: "^1.05 points",
			cost: new Decimal(3),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			effect() {return new Decimal(1.05)},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 32)},
			branches: [[53, "#ffffff", 8],[54, "#ffffff", 8]],
		},
		51: {
			title: "fasterer",
			description: "prestige tokens add to first point buyable at a one-fourth rate",
			cost: new Decimal(2),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			effect() {return new Decimal(1)},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 52)},
			branches: [[61, "#ffffff", 8]],
		},
		52: {
			title: "perstige bootser",
			description: "×1.5 super prestige points",
			cost: new Decimal(5),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			effect() {return new Decimal(1.5)},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 41) || hasUpgrade('spr', 42)},
			branches: [[51, "#ffffff", 8],[62, "#ffffff", 8]],
		},
		53: {
			title: "strongerer",
			description: "prestige tokens add to second point buyable at a one-fourth rate",
			cost: new Decimal(2),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			effect() {return new Decimal(1)},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 43)},
			branches: [[62, "#ffffff", 8]],
		},
		54: {
			title: "superpower",
			description: "+0.25 first power tier milestone base",
			cost: new Decimal(8),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			canAfford() {return hasUpgrade('spr', 43)},
			unlocked() {return hasUpgrade('spr', 11)},
		},
		61: {
			title: "prestige buyable auto thing",
			description: "prestige point buyables no longer spend resources, and are autobought",
			cost: new Decimal(2),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			canAfford() {return hasUpgrade('spr', 51)},
			unlocked() {return hasUpgrade('spr', 11)},
		},
		62: {
			title: "power what now?",
			description: "unlock a new tree node",
			cost: new Decimal(30),
			currencyDisplayName: "total prestige tokens",
			currencyInternalName: "total_tokens",
			currencyLocation() {return player[this.layer]},
			unlocked() {return hasUpgrade('spr', 11)},
			canAfford() {return hasUpgrade('spr', 52) || hasUpgrade('spr', 53)},
			branches: [[71, "#ffffff", 8]],
		},
		71: {
			title: "nyi",
			description: "see you in v0.1!",
			cost: new Decimal(69420),
			currencyDisplayName: "prestige tokens",
			currencyInternalName: "tokens",
			currencyLocation() {return player[this.layer]},
			canAfford() {return hasUpgrade('spr', 62)},
			unlocked() {return hasUpgrade('spr', 11)},
		},
	},
	milestones: {
    	0: {
        	requirementDescription: "1,000,000 super prestige points",
        	effectDescription: "unlock a new layer",
        	done() { return player.spr.points.gte(1e6) },
    	},
	},
	clickables: {
		11: {
			title() {return "re-run super prestige"},
			canClick() {return hasUpgrade("spr", 21)},
			onClick() {
				layerDataReset("p", ["milestones"]);
				layerDataReset("pr", ["milestones"]);
				layerDataReset("pt");
				player.points = new Decimal(10);
				setBuyableAmount("spr", 11, new Decimal(0));
				setBuyableAmount("spr", 12, new Decimal(0));
				player[this.layer].total_tokens = getBuyableAmount('spr', 13);
				player[this.layer].tokens = player[this.layer].total_tokens;
				layerDataReset(this.layer, ["milestones", "points", "tokens", "total_tokens", "total", "best", "buyables"])
				player[this.layer].points = player[this.layer].points.add(1);
				buyUpgrade(this.layer, 11);
			},
			style() {return {
				height: "64px",
				width: "576px",
			}}
		},
	},
	tabFormat: {
		"Main": {
			content: [
				"main-display",
    			"prestige-button",
				["display-text",
					function() { return 'You have ' + format(player.pr.points) + ' prestige points' },
					{}],
				"blank",
    			"milestones",
				"blank",
    			["row", [["upgrade", 11], ["upgrade", 12], ["upgrade", 13], ["upgrade", 14]]],
			],
		},
		"Token Tree": {
			content: [
				"main-display",
    			"prestige-button",
				["display-text",
					function() { return 'You have ' + format(player.pr.points) + ' prestige points' },
				{}],
				"blank",
    			"buyables",
				["display-text",
					function() { return 'You have ' + format(player[this.layer].tokens) + ' prestige tokens (' + format(player[this.layer].total_tokens) + ' total)' },
				{}],
				"blank",
				"clickables",
				"blank",
				["upgrade-tree", [[21],[31, 32],[41, 42, 43],[51, 52, 53, 54],[61, 62],[71]]],
			],
		},
	},
	update() {
		player[this.layer].total_tokens = getBuyableAmount('spr', 11).add(getBuyableAmount('spr', 12).add(getBuyableAmount('spr', 13)))
	},
	onPrestige() {
		layerDataReset("p", ["milestones"]);
		layerDataReset("pr", ["milestones"]);
		layerDataReset("pt");
		player.points = new Decimal(10);
		setBuyableAmount("spr", 11, new Decimal(0));
		setBuyableAmount("spr", 12, new Decimal(0));
		player[this.layer].total_tokens = getBuyableAmount('spr', 13);
		player[this.layer].tokens = player[this.layer].total_tokens;
		flag_1 = hasUpgrade(this.layer, 11);
		layerDataReset(this.layer, ["milestones", "points", "tokens", "total_tokens", "total", "best", "buyables"])
		if (flag_1) {
			player[this.layer].points = player[this.layer].points.add(1);
			buyUpgrade(this.layer, 11);
		}
	},
    row: 2,
    hotkeys: [
        {key: "s", description: "S: Reset for super prestige", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasMilestone('pr', 0)},
	doReset(resettingLayer) {
		let keep = [];
		keep.push("milestones")
		if (layers[resettingLayer].row > this.row) layerDataReset("spr", keep)
	},
})
// SIDE BELOW
addLayer("ach", {
    name: "achievements",
    symbol: "a",
    position: 0,
    startData() { return {
        unlocked: true,
    }},
    color: "#ffff00",
    type: "none",
	achievements: {
		11: {
			name: "start",
			tooltip: "purchase the first point upgrade",
			done() {return hasUpgrade('p', 11)},
		},
		12: {
			name: "the real start",
			tooltip: "purchase one of the first point buyable",
			done() {return getBuyableAmount('p', 11).gte(1)},
		},
		13: {
			name: "big bobuck",
			tooltip: "purchase one of the third point buyable",
			done() {return getBuyableAmount('p', 13).gte(1)},
		},
		14: {
			name: "the great slog of pre-prestige",
			tooltip: "have 10,000,000 points",
			done() {return player.p.points.gte(1e7)},
		},
		15: {
			name: "this is huge",
			tooltip: "prestige for the first time",
			done() {return player.pr.points.gt(0)},
		},
		21: {
			name: "accelerating upgrades",
			tooltip: "purchase two of the first prestige point buyable",
			done() {return getBuyableAmount('pr', 11).gte(2)},
		},
		22: {
			name: "power-up!",
			tooltip: "power tier up",
			done() {return player.pt.points.gt(0)},
		},
		23: {
			name: "lots of things all at once",
			tooltip: "purchase eight of the second prestige point buyable",
			done() {return getBuyableAmount('pr', 12).gte(8)},
		},
		24: {
			name: "automated!!1",
			tooltip: "reach power tier 5",
			done() {return hasMilestone('pt', 2)},
		},
		25: {
			name: "it's so over",
			tooltip: "super prestige for the first time",
			done() {return player.spr.points.gt(0)},
		},
		31: {
			name: "this is fine",
			tooltip: "prestige after doing a super prestige",
			done() {return hasUpgrade('spr', 11) && player.pr.points.gt(0)},
		},
		32: {
			name: "welcome back",
			tooltip: "super prestige a second time",
			done() {return hasUpgrade('spr', 11) && player.spr.points.gte(1)},
		},
		33: {
			name: "overdrive",
			tooltip: "reach power tier 20",
			done() {return player.pt.points.gte(20)},
		},
		34: {
			name: "t o k e n s",
			tooltip: "reach 20 total prestige tokens",
			done() {return player.spr.total_tokens.gte(20)},
		},
		35: {
			name: "if i had a dime for every time i said prestige...",
			tooltip: "begin generating prestige power... also ENDGAME!",
			done() {return hasUpgrade('spr', 62)},
		},
		41: {
			name: "absolutely abhorrent anti-automators",
			tooltip: "super prestige without any power tiers",
			done() {return player.pt.points.gte(20)},
		},
	},
    row: "side",
	tooltip() {return "achievements"},
    layerShown(){return true}
})