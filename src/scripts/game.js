var game1;
$(document).ready(function()
{
    game1 = new game();
    game1.start();
    console.log(game1);
});
var holdClick;
class game {
    money;
    clickStrength;
    upgrades;
    holdClicksPerSecond;
    generators;
    constructor()
    {
        this.money = 1000;
        this.clickStrength = 1;
        this.holdClicksPerSecond = 10;
        this.upgrades = {
            "hasHoldClick": true
        };
        this.generators = {
            "baker" : new Generator(this, "Baker", 10, 1, 9000, 1.05, 9000, 10, 27)
        };
    }
    gainClickMoney()
    {
        game1.money += game1.clickStrength;
        $("#topBar .counterDiv#money .value").text(game1.money);
    }
    start()
    {
        this.buildUI();
        console.log("game started");
    }
    buildUI()
    {
        var topbar = $("#topBar");
        var leftBar = $("#leftBar");
        topbar.append(getCounterDiv("money", "Geld:", this.money));
        this.buildGenerators(this.generators);
        this.addGameEventListeners();
    }
    /**
     * Appends a div for each generator
     * @param {Generator[]} generators 
     */
    buildGenerators(generators)
    {
        var leftBar = $("#leftBar");
        for (var key in generators) {
            leftBar.append(getGeneratorDiv(key, generators[key]));
        }
    }
    addGameEventListeners()
    {
       $("#clickButton").on("mousedown", function()
        {
            $(this).attr("style", "width:180px;height:108px;top:calc(50% - 90px);left:calc(50% - 54px);font-size:28.5px");
            if (game1.upgrades.hasHoldClick)
            {
                console.log("hold");
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
function getCounterDiv(id, label, value)
{
    return $('<div id="'+id+'" class="counterDiv"><div class="label">'+label+'</div><div class="value">'+value+'</div></div>');
}
/**
 * Get jQuery object of generator div
 * @param {string} id id of HTML element
 * @param {Generator} generator Generator object
 * @returns {object} jQuery object of Generator
 */
function getGeneratorDiv(id, generator)
{
    var generatorD = getJQDiv(id, "generatorDiv");
    var upperPart = getUpperGeneratorDiv(generator);
    var lowerPart = getJQDiv("", "lowerHalf");
    generatorD.append(upperPart);
    generatorD.append(lowerPart);
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
    var timeLeft = generator.productionTime - (timePassed);
    console.log(generator.productionTime);
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
     * @param {string} name name of Generator
     * @param {number} baseRevenue base revenue without multiplier
     * @param {number} owned number of owned Generator
     * @param {number} baseProductionTime base production time without multipliers in seconds
     * @param {number} costfactor factor the buy price scales
     * @param {number} productionTime actual production time in seconds
     * @param {number} baseCost base cost for first level of Generator
     * @param {number} currentProgress current progress in percent
     */
    constructor(game, name, baseRevenue, owned, baseProductionTime, costfactor, productionTime, baseCost, currentProgress)
    {
        this.name = name;
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
     * Get Revenue of Generator
     * @returns {number} money gained in one cycle
     */
    getRevenue()
    {
        return this.baseRevenue;
    }
    /**
     * Check if you can buy certain amount of Generators
     * @param {number} quantity count of Generators intended to buy
     * @returns {boolean} if Generators can be bought
     */
    canBeBuilt(quantity)
    {
        if (getBuildCost(quantity) <= this.game.money)
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
        return this.baseCost * (((Math.pow(this.costfactor, this.owned)) - (Math.pow(this.costfactor, (this.owned + quantity)))) / (1 - this.costfactor));
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