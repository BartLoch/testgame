var game1;
$(document).ready(function()
{
    game1 = new game();
    game1.start();
});
var holdClick;
class game {
    money;
    clickStrength;
    upgrades;
    holdClicksPerSecond;
    generators;
    runTimer;
    saveTimer;
    tps; //ticks per seonds
    constructor()
    {
        this.money = 10000;
        this.clickStrength = 1;
        this.holdClicksPerSecond = 10;
        this.upgrades = {
            "hasHoldClick": true
        };
        this.generators = {
            0 : new Generator(this, "news", "Newsstand", 1, 1, 0.6, 1.07, 0.6, 4, 0),
            1: new Generator(this, "shoe", "Shoe Seller", 60, 0, 3, 1.15, 3, 60, 0),
            2: new Generator(this, "mower", "Lawn Mower Seller", 540, 0, 6, 1.14, 6, 720, 0),
            3: new Generator(this, "car", "Car Seller", 4320, 0, 12, 1.13, 12, 8640, 0),
            4: new Generator(this, "landlord", "Landlord", 51840, 0, 24, 1.12,24,103680,0),
            5 : new Generator(this, "estate", "Estate Seller", 622080, 0, 96, 1.11, 96, 1244160,0),
            6: new Generator(this, "bank", "Bank", 7464960,0,384, 1.1,384,14929920,0)
        };
        if (localStorage.hasOwnProperty("save"))
        {
            var save = JSON.parse(localStorage.save);
            this.generators = this.loadGeneratorSave(save.generators);
            this.money = save.money;
        }
        this.tps = 25;
    }
    loadGeneratorSave(generators)
    {
        if (generators.hasOwnProperty("news"))
        {
            return {
                0 : new Generator(this, "news", "Newsstand", 1, generators["news"].owned, 0.6, 1.07, 0.6, 4, 0),
                1: new Generator(this, "shoe", "Shoe Seller", 60, generators["shoe"].owned, 3, 1.15, 3, 60, 0),
                2: new Generator(this, "mower", "Lawn Mower Seller", 540, generators["mower"].owned, 6, 1.14, 6, 720, 0),
                3: new Generator(this, "car", "Car Seller", 4320, generators["car"].owned, 12, 1.13, 12, 8640, 0),
                4: new Generator(this, "landlord", "Landlord", 51840, generators["landlord"].owned, 24, 1.12,24,103680,0),
                5 : new Generator(this, "estate", "Estate Seller", 622080, generators["estate"].owned, 96, 1.11, 96, 1244160,0),
                6: new Generator(this, "bank", "Bank", 7464960,generators["bank"].owned,384, 1.1,384,14929920,0)
            };
        }
        else
        {
            return {
                0 : new Generator(this, "news", "Newsstand", 1, generators[0].owned, 0.6, 1.07, 0.6, 4, 0),
                1: new Generator(this, "shoe", "Shoe Seller", 60, generators[1].owned, 3, 1.15, 3, 60, 0),
                2: new Generator(this, "mower", "Lawn Mower Seller", 540, generators[2].owned, 6, 1.14, 6, 720, 0),
                3: new Generator(this, "car", "Car Seller", 4320, generators[3].owned, 12, 1.13, 12, 8640, 0),
                4: new Generator(this, "landlord", "Landlord", 51840, generators[4].owned, 24, 1.12,24,103680,0),
                5 : new Generator(this, "estate", "Estate Seller", 622080, generators[5].owned, 96, 1.11, 96, 1244160,0),
                6: new Generator(this, "bank", "Bank", 7464960,generators[6].owned,384, 1.1,384,14929920,0)
            };
        }
        
    }
    gainClickMoney()
    {
        game1.money += game1.clickStrength;
        $("#topBar .counterDiv#money .value").text(moneyFormat(game1.money));
    }
    start()
    {
        this.buildUI();
        this.run();
    }
    buildUI()
    {
        console.log(this.generators);
        var topbar = $("#topBar");
        var leftBar = $("#leftBar");
        topbar.append(getCounterDiv("money", "Geld:", this.money));
        this.buildGenerators(this.generators);
        this.addGameEventListeners();
    }
    updateUI()
    {
        $("#money > div.value").text(moneyFormat(this.money));
        $.each(this.generators, function(key, value)
        {
            value.updateGenratorDiv();
        });
    }
    runHelper()
    {
        this.money += this.generatorsProduce();
        $("#money > div.value").text(moneyFormat(this.money));
    }
    run()
    {
        var self = this;
        self.runTimer = setInterval(function() {
            self.money += self.generatorsProduce();
            self.updateUI();
        },1000/self.tps);
        self.saveTimer = setInterval(function() {
            self.save();
        }, 60000);
    }
    save()
    {
        let save = {
            money: this.money,
            generators: this.generators
        };
        localStorage.save = JSON.stringify(save);
        showToast("Saved automatically");
    }
    generatorsProduce()
    {
        var timePassed = 1000/this.tps;
        var moneyProduced = 0;
        $.each(this.generators, function(key, value)
        {
            moneyProduced += value.produce(timePassed);
        });
        return moneyProduced;
    }
    /**
     * Appends a div for each generator
     * @param {Generator[]} generators 
     */
    buildGenerators(generators)
    {
        var leftBar = $("#leftBar");
        for (var key in generators) {
            var hidden = false;
            if (key > 0 && (generators[key-1].owned == 0))
                hidden = true;
            leftBar.append(getGeneratorDiv(key, generators[key], hidden));
        }
    }
    addGameEventListeners()
    {
       $("#clickButton").on("mousedown", function()
        {
            $(this).attr("style", "width:180px;height:108px;top:calc(50% - 90px);left:calc(50% - 54px);font-size:28.5px");
            if (game1.upgrades.hasHoldClick)
            {
                game1.gainClickMoney();
                holdClick = setInterval(game1.gainClickMoney, (1000/game1.holdClicksPerSecond));
            }
        });
        $("#clickButton").on("mouseup", function()
        {
            $(this).removeAttr("style");
            if (!game1.upgrades.hasHoldClick)
            {
                game1.gainClickMoney();
            }
            else
            {
                clearInterval(holdClick);
            }
        });
    }
}
function showToast(message)
{
    var toast = getJQDiv("toast", "toastmessage", "display:none;", {});
    toast.text(message);
    $("body").append(toast);
    $("#toast").fadeToggle();
    setTimeout(function(){
        $("#toast").fadeToggle(function() {$(this).remove()});
    }, 5000);

}
function getCounterDiv(id, label, value)
{
    return $('<div id="'+id+'" class="counterDiv"><div class="label">'+label+'</div><div class="value">'+value+'</div></div>');
}
function getGeneratorIndexById(id)
{
    var result = -1;
    switch (id) {
        case "news":
            return 0;
            break;
        case "shoe":
            return 1;
            break;
        case "mower":
            return 2;
            break;
        case "car":
            return 3;
            break;
        case "landlord":
            return 4;
            break;
        case "estate":
            return 5;
            break;
        case "bank":
            return 6;
            break;  
        default:
            return -1;
        break;
    }
}
/**
 * Get jQuery object of generator div
 * @param {string} id id of HTML element
 * @param {Generator} generator Generator object
 * @returns {object} jQuery object of Generator
 */
function getGeneratorDiv(id, generator, hidden)
{
    var generatorD = getJQDiv(generator.id, "generatorDiv");
    var upperPart = getUpperGeneratorDiv(generator);
    var lowerPart = getLowerGeneratorDiv(generator);
    generatorD.append(upperPart);
    generatorD.append(lowerPart);
    if (hidden)
        generatorD.hide();
    return generatorD;
}
/**
 * Get upper Half of Generator div
 * @param {Generator} generator 
 * @returns {object} jQuery object of upper half of generator div 
 */
function getUpperGeneratorDiv(generator)
{
    var upperPart = getJQDiv("", "upperHalf");
    var titleAndLvl = getJQDiv("", "titleAndLevel");
    var title = getJQDiv("", "title");
    var lvl = getJQDiv("", "level");
    var progressBar = getProgressBar(generator);
    
    title.text(generator.name);
    lvl.text("Lvl "+generator.owned);
    titleAndLvl.append(title);
    titleAndLvl.append(lvl);
    upperPart.append(titleAndLvl);
    upperPart.append(progressBar);
    return upperPart;
}
/**
 * Get lower Half of Generator div
 * @param {Generator} generator 
 * @returns {object} jQuery object of upper half of generator div 
 */
function getLowerGeneratorDiv(generator)
{
    var lowerPart = getJQDiv("", "lowerHalf");
    var moneyDiv = getJQDiv("", "money");
    var label = getJQDiv("", "label");
    var value = getJQDiv("", "value");
    var upgradeButtonsDiv = getUpgradeButtonsDiv(generator);

    label.text("Money: ");
    value.text(generator.getRevenueLabel());
    moneyDiv.append(label);
    moneyDiv.append(value);

    lowerPart.append(moneyDiv);
    lowerPart.append(upgradeButtonsDiv);
    return lowerPart;
}
function getUpgradeButton(generator, steps)
{
    var button = getJQDiv("", "button");
    var upperHalf = getJQDiv("", "stepsLabel");
    var lowerHalf = getJQDiv("", "upgradePrice");

    button.attr("data-steps", steps);
    upperHalf.text("+"+steps);
    lowerHalf.text(moneyFormat(generator.getBuildCost(steps)));
    button.append(upperHalf);
    button.append(lowerHalf);
    var revenue = generator.baseRevenue * (generator.owned+steps);
    var self = generator;
    button.click(function () 
    {
        if (self.canBeBuilt(steps))
        {
           self.build(steps);
        }
    });
    return button;
}
function getUpgradeButtonsDiv(generator)
{
    let wrapperDiv = getJQDiv("", "upgradeBtnWrapper");
    let one = getUpgradeButton(generator, 1);
    let ten = getUpgradeButton(generator, 10);
    let hundred = getUpgradeButton(generator, 100);
    wrapperDiv.append(one);
    wrapperDiv.append(ten);
    wrapperDiv.append(hundred);
    return wrapperDiv;
}
/**
 * Get progressbar of worker
 * @param {Generator} generator 
 */
function getProgressBar(generator)
{
    var progressbar = getJQDiv("", "progressBar", "", {time: generator.productionTime});
    var barBG = getJQDiv("", "background");
    var progressbarBar = getJQDiv("", "bar");
    var progressbarLabel = getJQDiv("", "label");
    progressbarBar.css("right", (100 - generator.currentProgress)+"%");
    progressbarLabel.text(updateProgressBarLabel(generator));
    progressbar.append(barBG);
    progressbar.append(progressbarBar);
    progressbar.append(progressbarLabel);
    return progressbar;
}
/**
 * 
 * @param {Generator} generator 
 */
function updateProgressBarLabel(generator)
{
    var timePassed = generator.currentProgress / 100 * generator.productionTime;
    var timeLeft = generator.productionTime - timePassed;
    if (timeLeft < 60)
        return parseInt(timeLeft).toString() + " s";
    else
    {
        if (timeLeft < 3600)
            return parseInt(timeLeft / 60) + " m " + parseInt(timeLeft % 60) + " s";
        else
        {
            let hours = parseInt(timeLeft / 3600);
            let minutes = parseInt((timeLeft % 3600) / 60);
            let seconds = parseInt((timeLeft % 3600) % 60);
            return hours + " h " + minutes + " m " + seconds + " s";
        }
    }
}
/**
 * Class representing a Woker/Money Generator
 */
class Generator
{
    id;
    name;
    baseRevenue;
    owned;
    baseProductionTime;
    baseCost;
    costfactor;
    productionTime;
    currentProgress;
    /**
     * Create a Worker
     * @param {game} game object of instance game
     * @param {string} id id of benerator (also of html div)
     * @param {string} name name of Generator
     * @param {number} baseRevenue base revenue without multiplier
     * @param {number} owned number of owned Generator
     * @param {number} baseProductionTime base production time without multipliers in seconds
     * @param {number} costfactor factor the buy price scales
     * @param {number} productionTime actual production time in seconds
     * @param {number} baseCost base cost for first level of Generator
     * @param {number} currentProgress current progress in percent
     */
    constructor(game, id, name, baseRevenue, owned, baseProductionTime, costfactor, productionTime, baseCost, currentProgress)
    {
        this.name = name;
        this.id = id;
        this.baseRevenue = baseRevenue;
        this.owned = owned;
        this.baseProductionTime = baseProductionTime;
        this.costfactor = costfactor;
        this.productionTime = productionTime;
        this.baseCost = baseCost;
        if (currentProgress > 100 || currentProgress < 0)
            currentProgress = 0;
        this.currentProgress = currentProgress;
    }
    /**
     * Produce Money
     * @param {number} time that has gone into production
     * @returns {number} produced money
     */
    produce(timePassed)
    {
        if (this.owned == 0)
        {
            return 0;
        }
        this.currentProgress += timePassed / 10 / this.productionTime;
        var producedMoney = 0;
        while (this.currentProgress > 100) {
            producedMoney += this.baseRevenue * this.owned;
            this.currentProgress -= 100;
        }
        return producedMoney;
    }
    /**
     * Check if you can buy certain amount of Generators
     * @param {number} quantity count of Generators intended to buy
     * @returns {boolean} if Generators can be bought
     */
    canBeBuilt(quantity)
    {
        if (this.getBuildCost(quantity) <= game1.money)
            return true;
        return false;
    }
    /**
     * Get building cost to buy certain amount of Generators
     * @param {number} quantity count of Generators intended to buy
     * @returns {number} building cost of Generators
     */
    getBuildCost(quantity)
    {
        return Math.floor(this.baseCost * (((Math.pow(this.costfactor, this.owned)) - (Math.pow(this.costfactor, (this.owned + quantity)))) / (1 - this.costfactor)));
    }
    /**
     * 
     * @returns {string} revenue for display in generator div
     */
    getRevenueLabel()
    {
        let revenue = this.baseRevenue * this.owned;
        let str = "+";
        str += moneyFormat(revenue);
        str += " (" + moneyFormat(revenue / this.productionTime, 2) + "/s)";
        return str;
    } 
    updateGenratorDiv()
    {
        var progressbarBar = $("#"+this.id+" .upperHalf .progressBar .bar");
        var progressbarLabel = $("#"+this.id+" .upperHalf .progressBar .label");
        progressbarBar.css("right", (100 - this.currentProgress)+"%");
        progressbarLabel.text(updateProgressBarLabel(this));
    }
    build(quantity)
    {
        game1.money -= this.getBuildCost(quantity);
            this.owned += quantity;
            game1.updateUI();
            this.updateUpgradeButtons();
            this.updateLevelLabel();
        if (this.owned > 0 && (this.owned - quantity >= 0))
        {
            let nextIndex = getGeneratorIndexById(this.id) + 1;
            if (game1.generators.hasOwnProperty(nextIndex))
            {
                $("#"+game1.generators[nextIndex].id).show();
            }
        }
            
    }
    updateUpgradeButtons()
    {        
        var lowerPart = getLowerGeneratorDiv(this);
        $("#"+this.id+" .lowerHalf").remove();
        $("#"+this.id).append(lowerPart);
    }
    updateLevelLabel()
    {
        $("#"+this.id+" .upperHalf .titleAndLevel .level").text("Lvl "+this.owned);
    }
}
/**
 * Get jQuery object of a div
 * @param {string} id id of div
 * @param {string} classes class attribute of div
 * @param {string} style style attribute of div
 * @param {object} data data attributes of div
 * @returns {object} JQuery object
 */
function getJQDiv(id, classes = "", style = "", data = {})
{
    var div = $('<div id="'+id+'" class="'+classes+'" style="'+style+'"></div>');
    if (data.length > 0)
    {
        for (const key in data) {
            if (data.hasOwnProperty.call(data, key)) {
                const element = data[key];
                div.attr("data-"+key, data[key]);
            }
        }
    }
    return div;
}
function moneyFormat(money, nachkommastellen = 0)
{
    var letter = 0;
    while (money > 1000)
    {
        letter += 1;
        money /= 1000;
    }
    money = Intl.NumberFormat("de-DE", {style:"decimal", maximumFractionDigits: 3, minimumFractionDigits: 0}).format(money);
    var returnString = money.toString();
    returnString += " ";
    switch (letter)
    {
        case 1:
            returnString += "K";
            break;
        case 2:
            returnString += "M";
            break;
        case 3:
            returnString += "B";
            break;
        case 4:
            returnString += "T";
            break;
        case 5: 
            returnString += "Qu";
            break;
        case 5: 
            returnString += "Qi";
            break;
    }
    return returnString;
}