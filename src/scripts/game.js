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
    workers;
    constructor()
    {
        this.money = 1000;
        this.clickStrength = 1;
        this.holdClicksPerSecond = 10;
        this.upgrades = {
            "hasHoldClick": true
        };
        this.workers = [
            new Worker(this, "Baker", 5, 1, 10, 1.05, 10, 10)
        ];
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
        leftBar.append(getWorkerDiv("pfand", "Pfandsammeln", this.pfand));
        this.addGameEventListeners();
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
function getWorkerDiv(id, label, workerSave)
{
    return $('<div id="'+id+'" class="workerDiv"><div class="label">'+label+'</div></div>');
}
class Worker
{
    name;
    baseRevenue;
    owned;
    baseProductionTime;
    baseCost;
    costfactor;
    productionTime;
    constructor(game, name, baseRevenue, owned, baseProductionTime, costfactor, productionTime, baseCost)
    {
        this.name = name;
        this.baseRevenue = baseRevenue;
        this.owned = owned;
        this.baseProductionTime = baseProductionTime;
        this.costfactor = costfactor;
        this.productionTime = productionTime;
        this.baseCost = baseCost;
    }
    getRevenue()
    {
        return this.baseRevenue;
    }
    canBeBuilt(quantity)
    {
        if (getBuildCost(quantity) <= this.game.money)
            return true;
        return false;
    }
    getBuildCost(quantity)
    {
        return this.baseCost * (((Math.pow(this.costfactor, this.owned)) - (Math.pow(this.costfactor, (this.owned + quantity)))) / (1 - this.costfactor));
    }
    
}