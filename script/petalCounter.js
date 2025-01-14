// @license agpl
// @require https://unpkg.com/string-similarity@4.0.4/umd/string-similarity.min.js

var obj =
    {
        rarity: 0,
        id: 1,
        aim: 5,
        basicId: 605463,
        find: {
            petal: "Basic",
            value: [5, 0, 0, 0, 0, 0, 0, 0]
        },
        config: {
            top: false,
            left: false,
            x: "-20px",
            y: "-20px",
            scale: 1,
            key: "Equal"
        },
        version: "1.2",
        versionHash: versionHash,
        autoFind: true,
        multipleCounting: {
            enable: false,
            petal: {
                "Common Basic": 5,
                "Common Light": 5
            },
            key: "Minus"
        }
    },
    petal = "Common Basic",
    rarityArr = [
        "Common",
        "Unusual",
        "Rare",
        "Epic",
        "Legendary",
        "Mythic",
        "Ultra",
        "Super",
        "Unique"
    ],
    rarityColors = [
        "#7EEF6D",
        "#FFE65D",
        "#4D52E3",
        "#861FDE",
        "#DE1F1F",
        "#1FDBDE",
        "#FF2B75",
        "#2BFFA3",
        "#444444"
    ],
    petalArr = [
        "Basic",
        "Light",
        "Rock",
        "Square",
        "Rose",
        "Stinger",
        "Iris",
        "Wing",
        "Missile",
        "Grapes",
        "Cactus",
        "Faster",
        "Bubble",
        "Pollen",
        "Dandelion",
        "Beetle Egg",
        "Antennae",
        "Heavy",
        "Yin Yang",
        "Web",
        "Honey",
        "Leaf",
        "Salt",
        "Rice",
        "Corn",
        "Sand",
        "Pincer",
        "Yucca",
        "Magnet",
        "Yggdrasil",
        "Starfish",
        "Pearl",
        "Lightning",
        "Jelly",
        "Claw",
        "Shell",
        "Cutter",
        "Dahlia",
        "Uranium",
        "Sponge",
        "Soil",
        "Fangs",
        "Third Eye",
        "Peas",
        "Stick",
        "Clover",
        "Powder",
        "Air",
        "Basil",
        "Orange",
        "Ant Egg",
        "Poo",
        "Relic",
        "Lotus",
        "Bulb",
        "Cotton",
        "Carrot",
        "Bone",
        "Plank",
        "Tomato",
        "Mark",
        "Rubber",
        "Blood Stinger",
        "Bur",
        "Root",
        "Ankh",
        "Dice",
        "Talisman",
        "Battery",
        "Amulet",
        "Compass",
        "Disc",
        "Shovel",
        "Coin",
        "Chip",
        "Card",
        "Moon",
        "Privet",
        "Glass",
        "Corruption",
        "Mana Orb",
        "Blueberries",
        "Magic Cotton",
        "Magic Stinger",
        "Magic Leaf",
        "Magic Cactus",
        "Magic Eye",
        "Magic Missile",
        "Magic Stick"
    ]

function getNewPetal(petalName) {
    var tempObj = {
        id : 1,
        rarity: 0,
        petal: ""
    }
    if (petalName.split(" ").length <= 0) return
    if (petalName.split(" ").length == 1) {
        if (petalName.startsWith("un") || petalName.startsWith("n")) tempObj.rarity = "Unusual"
        else if (petalName.startsWith("r")) tempObj.rarity = "Rare"
        else if (petalName.startsWith("e")) tempObj.rarity = "Epic"
        else if (petalName.startsWith("l")) tempObj.rarity = "Legendary"
        else if (petalName.startsWith("m")) tempObj.rarity = "Mythic"
        else if (petalName.startsWith("u")) tempObj.rarity = "Ultra"
        else if (petalName.startsWith("s")) tempObj.rarity = "Super"
        else if (petalName.startsWith("q")) tempObj.rarity = "Unique"
        else tempObj.rarity = "Common"
        tempObj.id = stringSimilarity.findBestMatch(petalName.slice(1), petalArr)
        petalName = tempObj.rarity + " " + tempObj.id.bestMatch.target
        tempObj.rarity = rarityArr.indexOf(tempObj.rarity)
    } else {
        tempObj.rarity = stringSimilarity.findBestMatch(petalName.split(" ").shift(), rarityArr)
        tempObj.id = stringSimilarity.findBestMatch(petalName.split(" ").splice(1).join(" "), petalArr)
        petalName = tempObj.rarity.bestMatch.target + " " + tempObj.id.bestMatch.target
        tempObj.rarity = tempObj.rarity.bestMatchIndex
    }
    tempObj.id = tempObj.id.bestMatchIndex + 1
    tempObj.petal = petalName
    return tempObj
}
var thisNewPetal = getNewPetal(petal)
obj.id = thisNewPetal.id
obj.rarity = thisNewPetal.rarity
petal = thisNewPetal.petal

function findSequence(seq, mem) {
    let match = 0
    for (let addr = 0; addr < mem.length; addr++) {
        if (mem[addr] === seq[match]) match++
        else if (mem[addr] === seq[0]) match = 1
        else match = 0
        if (match === seq.length) return addr - match + 1
    }
}

// https://stackoverflow.com/questions/47011055/smooth-vertical-scrolling-on-mouse-wheel-in-vanilla-javascript
function SmoothScroll(target, speed, smooth) {
    if (target === document) target = (document.scrollingElement || document.documentElement || document.body.parentNode || document.body)
    var moving = false
    var pos = target.scrollTop
    var frame = target === document.body && document.documentElement ? document.documentElement : target
    target.addEventListener('mousewheel', scrolled, { passive: false })
    target.addEventListener('DOMMouseScroll', scrolled, { passive: false })
    function scrolled(e) {
        e.preventDefault()
        var delta = normalizeWheelDelta(e)
        pos += -delta * speed
        pos = Math.max(0, Math.min(pos, target.scrollHeight - frame.clientHeight))
        if (!moving) update()
    }
    function normalizeWheelDelta(e) {
        if(e.detail) {
            if(e.wheelDelta) return e.wheelDelta/e.detail/40 * (e.detail>0 ? 1 : -1)
            else return -e.detail / 3
        } else return e.wheelDelta / 120
    }
    function update() {
        moving = true
        var delta = (pos - target.scrollTop) / smooth
        target.scrollTop += delta
        if (Math.abs(delta) > 0.5) requestFrame(update)
        else moving = false
    }
    var requestFrame = function() {
        return (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(func) {window.setTimeout(func, 1000 / 50)})
    }();
}

if (localStorage.getItem('petalFarmingCounter') == null) {
    localStorage.setItem('petalFarmingCounter', JSON.stringify(obj))
    setTimeout(() => {
        toggleCon()
        conCon.scrollTo(0, 110)
    }, 5000)
}
else {
    var thisObj = JSON.parse(localStorage.getItem('petalFarmingCounter'))
    if (thisObj.version != obj.version) {
        thisObj.version = obj.version
        setTimeout(() => {
            toggleCon()
            conCon.scrollTo(0, 110)
        }, 5000)
    }
    if (thisObj.versionHash != versionHash) {
        thisObj.versionHash = versionHash
        if (thisObj.autoFind) {
            setInterval(() => {
                thisObj.basicId = findSequence(thisObj.find.value, unsafeWindow.Module.HEAPU32) - ((stringSimilarity.findBestMatch(thisObj.find.petal, petalArr).bestMatchIndex + 1) * 8) + 8
                document.getElementById("Capply").innerHTML = `Basic ID: ${coloringValue(thisObj.basicId)}`
                var thisObj_ = JSON.parse(localStorage.getItem('petalFarmingCounter'))
                thisObj_.basicId = thisObj.basicId
                localStorage.setItem('petalFarmingCounter', JSON.stringify(thisObj_))
            }, 10000)
        }
    }
    if (Object.keys(thisObj.multipleCounting.petal).length < 2) thisObj.multipleCounting.petal = obj.multipleCounting.petal
    Object.keys(obj).forEach(k => {
        if (!Object.keys(thisObj).includes(k)) thisObj[k] = obj[k]
    })
    obj = thisObj
    localStorage.setItem('petalFarmingCounter', JSON.stringify(thisObj))
}

var thisPetalObj = {}
for (const [index, [key, value]] of Object.entries(Object.entries(obj.multipleCounting.petal))) {
    thisPetalObj[index] = {
        id: getNewPetal(key).id,
        rarity: getNewPetal(key).rarity,
        aim: value,
    }
}

var container = document.createElement("div")
container.id = "container"
container.style = `
    padding: 5px;
    height: 24px;
    width: 350px;
    position: absolute;
    transform: translate(${obj.config.x}, ${obj.config.y}) scale(${obj.config.scale});
    background: #333333;
    border-radius: 24px;
    transition: all 1s ease-in-out;
    opacity: 1;
    box-shadow: 5px 5px rgba(0, 0, 0, 0.3);
    pointer-events: all;
    cursor: pointer;
    overflow: hidden;
`
container.onclick = function() {
    toggleCon()
}

function toggleCon() {
    if (conCon.style.overflow == "hidden") {
        container.style.height = "300px"
        container.style.width = "400px"
        conCon.style.overflow = "hidden scroll"
        container.style.borderRadius = "5px"
        barProgress.style.maxHeight = "300px"
        barProgress.style.maxWidth = "400px"
        barProgress.style.height = "300px"
        barProgress.style.width = "400px"
        barProgress.style.borderRadius = "0px"
        barProgress.style.opacity = 0
        barProgress.style.background = "#1FDBDE"
        barProgress.style.pointerEvents = "none"
        barText.style.opacity = 0
        settings.style.pointerEvents = "all"
        settings.style.opacity = 1
        changelog.style.pointerEvents = "all"
        changelog.style.opacity = 1
    } else {
        container.style.height = "24px"
        container.style.width = "350px"
        conCon.style.overflow = "hidden"
        container.style.borderRadius = "24px"
        barProgress.style.maxHeight = "24px"
        barProgress.style.maxWidth = "350px"
        barProgress.style.height = "24px"
        barProgress.style.width = "350px"
        barProgress.style.borderRadius = "24px"
        barProgress.style.opacity = 1
        barProgress.style.background = "#F5FF65"
        barProgress.style.pointerEvents = "all"
        barText.style.opacity = 1
        settings.style.pointerEvents = "none"
        settings.style.opacity = 0
        changelog.style.pointerEvents = "none"
        changelog.style.opacity = 0
        updateProgress()
        updateMultiProgress()
    }
}
document.querySelector('body').appendChild(container)

var conCon = document.createElement("div")
conCon.style = `
    overflow: hidden;
    height: 300px;
`
container.appendChild(conCon)

new SmoothScroll(conCon, 90, 7)

containerPos()

petal = rarityArr[obj.rarity] + " " + petalArr[obj.id - 1]
thisNewPetal = getNewPetal(petal)
obj.id = thisNewPetal.id
obj.rarity = thisNewPetal.rarity
petal = thisNewPetal.petal
function convertNumber(value) {
    return Math.abs(Number(value)) >= 1.0e+9
        ? (Math.abs(Number(value)) / 1.0e+9).toFixed(2) + "B"
    : Math.abs(Number(value)) >= 1.0e+6
        ? (Math.abs(Number(value)) / 1.0e+6).toFixed(2) + "M"
    : Math.abs(Number(value)) >= 1.0e+3
        ? (Math.abs(Number(value)) / 1.0e+3).toFixed(2) + "K"
    : Math.abs(Number(value))
}

function containerPos() {
    if (obj.config.top) {
        container.style.top = "0"
        container.style.bottom = "unset"
    } else {
        container.style.top = "unset"
        container.style.bottom = "0"
    }

    if (obj.config.left) {
        container.style.left = "0"
        container.style.right = "unset"
    } else {
        container.style.left = "unset"
        container.style.right = "0"
    }

    container.style.transform = `translate(${obj.config.x}, ${obj.config.y}) scale(${obj.config.scale})`
}

function coloringBool(bool) {
    if (bool) return `<a style="color: #2BFFA3">${bool}</a>`
    else return `<a style="color: #DB5A5A">${bool}</a>`
}

function coloringValue(value) {
    return `<a style="color: #DBD74B">${value}</a>`
}

function coloringFunction(value) {
    return `<a style="color: #1FDBDE">${value}</a>`
}

obj.aim = Math.abs(Math.floor(obj.aim))
obj.aim = obj.aim == 0 ? 1 : obj.aim

function updateMultiProgress() {
    var multiProgressInnerHTML = "",
        thisMultiProgressValue
    if (obj.multipleCounting.enable) {
        for (const [index, [key, value]] of Object.entries(Object.entries(obj.multipleCounting.petal))) {
            thisMultiProgressValue = unsafeWindow.Module.HEAPU32[obj.basicId + (getNewPetal(key).id * 8) - (8 - getNewPetal(key).rarity)]
            multiProgressInnerHTML += `
        <br>
        <div style="margin-top: 5px">
            <div style="text-align: left; float: left; position: relative; top: -15px;">${key}</div>
            <div style="text-align: right; float: right; position: relative; top: -15px;">${convertNumber(thisMultiProgressValue)}/${convertNumber(value)}</div>
        </div>
        <div style="width: 99%;height: 7px;background: #222;border-radius: 5px;padding: 3px;margin: 2px 0 5px 0;">
            <div style="width: ${thisMultiProgressValue / value * 100}%;max-width:100%;background: ${rarityColors[getNewPetal(key).rarity]};height: 100%;border-radius: 3px; transition: all 1s ease-in-out;"></div>
        </div>
    `
        }
        multiProgress.innerHTML = multiProgressInnerHTML
    }
}
var multiProgress = document.createElement("div")
multiProgress.style = `
    top: 20px;
    right: -290px;
    width: 250px;
    height: auto;
    max-height: 200px;
    background: #333333;
    position: absolute;
    border-radius: 5px;
    padding: 15px;
    box-shadow: 5px 5px rgba(0, 0, 0, 0.3);
    overflow: hidden scroll;
    color: white;
    font-family: 'Ubuntu';
    transition: all 1s ease-in-out;
    font-size: 12px;
    text-shadow: rgb(0 0 0) 2px 0px 0px, rgb(0 0 0) 1.75517px 0.958851px 0px, rgb(0 0 0) 1.0806px 1.68294px 0px, rgb(0 0 0) 0.141474px 1.99499px 0px, rgb(0 0 0) -0.832294px 1.81859px 0px, rgb(0 0 0) -1.60229px 1.19694px 0px, rgb(0 0 0) -1.97998px 0.28224px 0px, rgb(0 0 0) -1.87291px -0.701566px 0px, rgb(0 0 0) -1.30729px -1.5136px 0px, rgb(0 0 0) -0.421592px -1.95506px 0px, rgb(0 0 0) 0.567324px -1.91785px 0px, rgb(0 0 0) 1.41734px -1.41108px 0px, rgb(0 0 0) 1.92034px -0.558831px 0px;
`
document.querySelector("body").appendChild(multiProgress)
new SmoothScroll(multiProgress, 90, 7)

function multiProgressToggle() {
    multiProgress.style.right = multiProgress.style.right == "20px" ? "-290px" : "20px"
}
var settings = document.createElement("div")
settings.style = `
    padding: 10px;
    color: white;
    font-family: 'Ubuntu';
    z-index: 1;
    font-size: 12px;
    line-height: 15px;
    opacity: 0;
    transition: all 1s ease-in-out;
    pointer-events: none;
    text-shadow: rgb(0 0 0) 2px 0px 0px, rgb(0 0 0) 1.75517px 0.958851px 0px, rgb(0 0 0) 1.0806px 1.68294px 0px, rgb(0 0 0) 0.141474px 1.99499px 0px, rgb(0 0 0) -0.832294px 1.81859px 0px, rgb(0 0 0) -1.60229px 1.19694px 0px, rgb(0 0 0) -1.97998px 0.28224px 0px, rgb(0 0 0) -1.87291px -0.701566px 0px, rgb(0 0 0) -1.30729px -1.5136px 0px, rgb(0 0 0) -0.421592px -1.95506px 0px, rgb(0 0 0) 0.567324px -1.91785px 0px, rgb(0 0 0) 1.41734px -1.41108px 0px, rgb(0 0 0) 1.92034px -0.558831px 0px;
`
conCon.appendChild(settings)

var settings_transform = document.createElement("div")
settings_transform.innerHTML = `
    <div style="font-size: 18px; margin-bottom: 10px; text-align: center;">Settings</div>
    <div id="sProgress" style="font-size: 15px; margin-top: 5px; margin-bottom: 5px;">Progress Counter</div>
    <div id="kProgress" style="margin-left: 10px; height: 0px; opacity: 0; pointer-events: none;">
        <div id="Cpetal">Petal: ${coloringValue(petal)}</div>
        <div id="Caim">Aim: ${coloringValue(obj.aim)}</div>
        <br>
        <div id="CMultiple_Toggle">Multiple counting: ${coloringBool(obj.multipleCounting.enable)}</div>
        <div id="CMultiple_petal">Petals: ${coloringValue(JSON.stringify(obj.multipleCounting.petal, null, "\u2001").replaceAll("\n", "<br>"))}</div>
        <div id="CMultiple_key">Key: ${coloringValue(obj.multipleCounting.key)}</div>
        <div id="CMultiple_view">${coloringFunction("View Progresses")}</div>
    </div>
    <div id="sTransform" style="font-size: 15px; margin-top: 5px; margin-bottom: 5px;">Position & Scale</div>
    <div id="kTransform" style="margin-left: 10px; height: 0px; opacity: 0; pointer-events: none;">
        <div id="Ctop">top: ${coloringBool(obj.config.top)}</div>
        <div id="Cleft">left: ${coloringBool(obj.config.left)}</div>
        <div id="CposX">x: ${coloringValue(obj.config.x)}</div>
        <div id="CposY">y: ${coloringValue(obj.config.y)}</div>
        <div id="Cscale">scale: ${coloringValue(obj.config.scale)}</div>
        <div id="CkeyToggle">Key: ${coloringValue(obj.config.key)}</div>
    </div>
    <div id="sFindId" style="font-size: 15px; margin-top: 5px; margin-bottom: 5px;">Find & Apply Basic ID</div>
    <div id="kFindId" style="margin-left: 10px; height: 0px; opacity: 0; pointer-events: none;">
        <div id="Cfind">${coloringFunction("Find & Apply")}</div>
        <div id="Capply">Basic ID: ${coloringValue(obj.basicId)}</div>
        <div id="CautoFind">Auto Update: ${coloringBool(obj.autoFind)}</div>
        <div id="Cinstruction">${coloringFunction("How to use?")}</div>
    </div>
`
settings.appendChild(settings_transform);

["sProgress", "sTransform", "sFindId"].forEach(x => {
    document.getElementById(x).onclick = function(e) {
        e.stopPropagation()
        var kTransform = document.getElementById("k"+ this.id.slice(1))
        if (kTransform.style.opacity != 1) {
            kTransform.style.opacity = 1
            kTransform.style.height = "auto"
            kTransform.style.pointerEvents = "all"
        } else {
            kTransform.style.opacity = 0
            kTransform.style.height = "0px"
            kTransform.style.pointerEvents = "none"
        }
    };
});

["Cpetal", "Caim", "CMultiple_Toggle", "CMultiple_petal", "CMultiple_key", "CMultiple_view", "Ctop", "Cleft", "CposX", "CposY", "Cscale", "CkeyToggle", "Cfind", "Capply", "CautoFind", "Cinstruction"].forEach(x => {
    document.getElementById(x).onclick = function(e) {
        e.stopPropagation()
        var value = "",
            value2 = [],
            endTime = 0,
            keysPressed = []
        if (["Cpetal", "Caim", "CMultiple_Toggle", "CMultiple_petal", "CMultiple_aim", "CMultiple_key", "CMultiple_view"].includes(this.id)) {
            if (["Cpetal"].includes(this.id)) {
                value = prompt('Petal name?', petal)
                if (petal == null) return
                petal = value
                var thisNewPetal = getNewPetal(petal)
                obj.id = thisNewPetal.id
                obj.rarity = thisNewPetal.rarity
                petal = thisNewPetal.petal
                this.innerHTML = `Petal: ${coloringValue(petal)}`
                barText.innerHTML = `${petal}: ${convertNumber(thisPetal)} / ${convertNumber(obj.aim)} (${(thisPetal * 100 / obj.aim).toFixed(2)}%)`
            } else if (["Caim"].includes(this.id)) {
                value = prompt('Aim?', obj.aim)
                if (value == null) return
                if (isNaN(value)) return alert(`Invalid input: [Aim] must be a number!`)
                obj.aim = Number(value)
                obj.aim = Math.abs(Math.floor(obj.aim))
                obj.aim = obj.aim == 0 ? 1 : obj.aim
                this.innerHTML = `Aim: ${coloringValue(obj.aim)}`
            } else if (["CMultiple_Toggle"].includes(this.id)) {
                value = !obj.multipleCounting.enable
                this.innerHTML = `Multiple counting: ${coloringBool(value)}`
                obj.multipleCounting.enable = value
            } else if (["CMultiple_petal"].includes(this.id)) {
                var count = 0,
                    petalObj = {},
                    thisPetalId, thisPetalRarity,
                    thisPetalObj = {}
                while (true) {
                    value = prompt(`${count + 1}. Petal name: Aim\nClick Cancel to Save & Exit`, `${Object.keys(obj.multipleCounting.petal)[count]}: ${Object.values(obj.multipleCounting.petal)[count]}`)
                    if (value == null) {
                        if (Object.keys(petalObj).length < 2) petalObj = obj.multipleCounting.petal
                        obj.multipleCounting.petal = petalObj
                        for (const [index, [key, value]] of Object.entries(Object.entries(obj.multipleCounting.petal))) {
                            thisPetalObj[index] = {
                                id: getNewPetal(key).id,
                                rarity: getNewPetal(key).rarity,
                                aim: value,
                            }
                        }
                        this.innerHTML = `Petals: ${coloringValue(JSON.stringify(obj.multipleCounting.petal, null, "\u2001").replaceAll("\n", "<br>"))}`
                        localStorage.setItem('petalFarmingCounter', JSON.stringify(obj))
                        return
                    }
                    value = value.split(":").map(x => x.trim())
                    if (isNaN(value[1])) {
                        alert(`Invalid input: [Aim] must be a number!`)
                        continue
                    }
                    petalObj[getNewPetal(value[0]).petal] = Number(value[1])
                    count++
                }
            } else if (["CMultiple_key"].includes(this.id)) {
                endTime = Date.now() + 5 * 1000
                this.innerHTML = `Key: <a class="blink">Press a key!</a>`
                var keyInterval_ = setInterval(() => {
                    keysPressed.unshift(lastKey)
                    if (keysPressed.length > 2) keysPressed.splice(2)
                    if (keysPressed[keysPressed.length - 1] != keysPressed[0]) {
                        obj.multipleCounting.key = keysPressed[0]
                        this.innerHTML = `Key: ${coloringValue(keysPressed[0])}`
                        clearInterval(keyInterval_)
                        localStorage.setItem('petalFarmingCounter', JSON.stringify(obj))
                        return
                    }
                    if (Date.now() > endTime) {
                        this.innerHTML = `Key: ${coloringValue(obj.multipleCounting.key)}`
                        clearInterval(keyInterval_)
                        return
                    }
                });
            } else if (["CMultiple_view"].includes(this.id)) multiProgressToggle()
        } else if (["Ctop", "Cleft", "CposX", "CposY", "Cscale", "CkeyToggle"].includes(this.id)) {
            if (["Ctop", "Cleft"].includes(this.id)) {
                value = !obj.config[x.slice(1)]
                this.innerHTML = `${x.slice(1)}: ${coloringBool(value)}`
                obj.config[x.slice(1)] = value
            } else if (["CposX", "CposY"].includes(this.id)) {
                value = prompt(x.slice(1), obj.config[x[x.length - 1].toLowerCase()].slice(0, -2))
                if (value == null) return
                if (isNaN(value)) return alert(`Invalid input: [${x.slice(1)}] must be a number!`)
                value = Number(value)
                this.innerHTML = `${x[x.length - 1].toLowerCase()}: ${coloringValue(value + "px")}`
                obj.config[x[x.length - 1].toLowerCase()] = value + "px"
            } else if (["Cscale"].includes(this.id)) {
                value = prompt(x.slice(1), obj.config[x.slice(1)])
                if (value == null) return
                if (isNaN(value)) return alert(`Invalid input: [${x.slice(1)}] must be a number!`)
                value = Number(value)
                if (value == 0) return
                this.innerHTML = `${x.slice(1)}: ${coloringValue(value)}`
                obj.config[x.slice(1)] = value
            } else if (["CkeyToggle"].includes(this.id)) {
                endTime = Date.now() + 5 * 1000
                this.innerHTML = `Key: <a class="blink">Press a key!</a>`
                var keyInterval = setInterval(() => {
                    keysPressed.unshift(lastKey)
                    if (keysPressed.length > 2) keysPressed.splice(2)
                    if (keysPressed[keysPressed.length - 1] != keysPressed[0]) {
                        obj.config.key = keysPressed[0]
                        this.innerHTML = `Key: ${coloringValue(keysPressed[0])}`
                        clearInterval(keyInterval)
                        localStorage.setItem('petalFarmingCounter', JSON.stringify(obj))
                        return
                    }
                    if (Date.now() > endTime) {
                        this.innerHTML = `Key: ${coloringValue(obj.config.key)}`
                        clearInterval(keyInterval)
                        return
                    }
                });
            }
            containerPos()
        } else if (["Cfind", "Capply", "CautoFind", "Cinstruction"].includes(this.id)) {
            if (["Cfind"].includes(this.id)) {
                var thisPetalName = ""
                value = prompt("Petal?", obj.find.petal)
                value = stringSimilarity.findBestMatch(value, petalArr)
                thisPetalName = value.bestMatch.target
                value = value.bestMatchIndex + 1
                rarityArr.forEach((x, i) => {
                    var temporaryValue = prompt(`Amount of ${x} ${thisPetalName}`, obj.find.value[i])
                    if (temporaryValue == null) temporaryValue = 0
                    if (isNaN(temporaryValue)) temporaryValue = 0
                    value2.push(Number(temporaryValue))
                })
                obj.find.petal = thisPetalName
                obj.find.value = value2
                obj.basicId = findSequence(value2, unsafeWindow.Module.HEAPU32) - (value * 8) + 8
                document.getElementById("Capply").innerHTML = `Basic ID: ${coloringValue(obj.basicId)}`
            } else if (["Capply"].includes(this.id)) {
                value = prompt('Basic ID?', obj.basicId)
                if (value == null) return
                if (isNaN(value)) return
                obj.basicId = Number(value)
                this.innerHTML = `Basic ID: ${coloringValue(obj.basicId)}`
            } else if (["CautoFind"].includes(this.id)) {
                value = !obj.autoFind
                this.innerHTML = `Auto Update: ${coloringBool(value)}`
                obj.autoFind = value
            } else if (["Cinstruction"].includes(this.id)) window.open("https://youtu.be/W2K6mWIzmHA?si=JWHOLJ67LSntThGW");
        }
        localStorage.setItem('petalFarmingCounter', JSON.stringify(obj))
    }
})

var changelog = document.createElement("div")
changelog.style = `
    padding: 10px;
    color: white;
    font-family: 'Ubuntu';
    z-index: 1;
    font-size: 12px;
    line-height: 15px;
    opacity: 0;
    transition: all 1s ease-in-out;
    pointer-events: none;
    text-shadow: rgb(0 0 0) 2px 0px 0px, rgb(0 0 0) 1.75517px 0.958851px 0px, rgb(0 0 0) 1.0806px 1.68294px 0px, rgb(0 0 0) 0.141474px 1.99499px 0px, rgb(0 0 0) -0.832294px 1.81859px 0px, rgb(0 0 0) -1.60229px 1.19694px 0px, rgb(0 0 0) -1.97998px 0.28224px 0px, rgb(0 0 0) -1.87291px -0.701566px 0px, rgb(0 0 0) -1.30729px -1.5136px 0px, rgb(0 0 0) -0.421592px -1.95506px 0px, rgb(0 0 0) 0.567324px -1.91785px 0px, rgb(0 0 0) 1.41734px -1.41108px 0px, rgb(0 0 0) 1.92034px -0.558831px 0px;
`
changelog.innerHTML = `
    <div style="font-size: 18px; margin-bottom: 10px; text-align: center;">Changelog</div>
    <div style="color: #1FDBDE; font-size: 15px; margin-top: 5px; margin-bottom: 5px">January 04th 2024 - v1.2</div>
    <div style="margin-left: 10px">
        - The container now has smooth scrolling effect (Credit to Manuel Otto).<br>
        - Added multiple petals counter.<br>
        - Added ${coloringValue("Auto update ID")} (this requires you to use ${coloringValue("Find & Apply")} at least one times).
    </div>
    <div style="color: #1FDBDE; font-size: 15px; margin-top: 5px; margin-bottom: 5px">December 24th 2023 - v1.1</div>
    <div style="margin-left: 10px">
        - Added 3 new petals.<br>
        - Added a manual way to find Basic ID: ${coloringValue("Find & Apply")} (Credit to Max Nest).<br>
        - The container is now moveable and scalable.<br>
        - Press ${coloringValue("=")} key to show/hide the container, this is also available in earlier versions. You can custom it in settings now.
    </div>
`
conCon.appendChild(changelog)

var barText = document.createElement("div")
barText.style = `
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    width: 100%;
    color: white;
    font-family: 'Ubuntu';
    text-align: center;
    transition: all 1s ease-in-out;
    text-wrap: nowrap;
    z-index: 1;
    pointer-events: none;
    font-size: 14px;
    text-shadow: rgb(0 0 0) 2px 0px 0px, rgb(0 0 0) 1.75517px 0.958851px 0px, rgb(0 0 0) 1.0806px 1.68294px 0px, rgb(0 0 0) 0.141474px 1.99499px 0px, rgb(0 0 0) -0.832294px 1.81859px 0px, rgb(0 0 0) -1.60229px 1.19694px 0px, rgb(0 0 0) -1.97998px 0.28224px 0px, rgb(0 0 0) -1.87291px -0.701566px 0px, rgb(0 0 0) -1.30729px -1.5136px 0px, rgb(0 0 0) -0.421592px -1.95506px 0px, rgb(0 0 0) 0.567324px -1.91785px 0px, rgb(0 0 0) 1.41734px -1.41108px 0px, rgb(0 0 0) 1.92034px -0.558831px 0px;
`
container.appendChild(barText)

var barProgress = document.createElement("div")
barProgress.style = `
    background: #F5FF65;
    border-radius: 24px;
    width: 0px;
    max-width: 350px;
    max-height: 24px;
    transition: all 1s ease-in-out;
    opacity: 0;
    height: 0px;
    top: 50%;
    position: absolute;
    transform: translate(0px, -50%);
`
container.appendChild(barProgress)
barText.innerHTML = `${petal}: 0 / ${convertNumber(obj.aim)} (0.00%)`

var thisPetal, thisWidth, thisAim, thisPetalObj_
function updateProgress() {
    if (!obj.multipleCounting.enable) {
        thisPetal = unsafeWindow.Module.HEAPU32[obj.basicId + (obj.id * 8) - (8 - obj.rarity)]
        thisAim = obj.aim
    } else {
        thisPetal = 0
        thisAim = 0
        thisPetalObj_ = {}
        for (const [index, [key, value]] of Object.entries(Object.entries(obj.multipleCounting.petal))) {
            thisPetalObj_[index] = {
                id: getNewPetal(key).id,
                rarity: getNewPetal(key).rarity,
                aim: value,
            }
        }
        for (const [index, [key, value]] of Object.entries(Object.entries(thisPetalObj_))) {
            thisPetal += Number(unsafeWindow.Module.HEAPU32[obj.basicId + (value.id * 8) - (8 - value.rarity)])
            thisAim += Number(value.aim)
        }
    }
    thisWidth = container.style.width.slice(0, -2) * thisPetal / thisAim
    barProgress.style.height = thisWidth + "px"
    barProgress.style.width = thisWidth + "px"
    barProgress.style.opacity = thisPetal / (thisAim * 0.08)
    if (!obj.multipleCounting.enable) barText.innerHTML = `${petal}: ${convertNumber(thisPetal)} / ${convertNumber(thisAim)} (${(thisPetal * 100 /thisAim).toFixed(2)}%)`
    else barText.innerHTML = `${Object.keys(obj.multipleCounting.petal).length} petals: ${convertNumber(thisPetal)} / ${convertNumber(thisAim)} (${(thisPetal * 100 / thisAim).toFixed(2)}%)`
}

setInterval(() => {
    if (conCon.style.overflow != "hidden") return
    updateProgress()
    updateMultiProgress()
}, 10000)

var lastKey
document.documentElement.addEventListener("keydown", function (e) {
    lastKey = e.code
    if (event.code == obj.config.key) {
        if (container.style.opacity == "0") {
            container.style.opacity = 1
            container.style.pointerEvents = "all"
            settings.style.pointerEvents = "all"
            changelog.style.pointerEvents = "all"
        } else {
            container.style.opacity = 0
            container.style.pointerEvents = "none"
            settings.style.pointerEvents = "none"
            changelog.style.pointerEvents = "none"
        }
    }
    if (event.code == obj.multipleCounting.key) multiProgressToggle()
})

document.querySelector('canvas').onclick = function () {
    container.style.height = "24px"
    container.style.width = "350px"
    conCon.style.overflow = "hidden"
    container.style.borderRadius = "24px"
    barProgress.style.maxHeight = "24px"
    barProgress.style.maxWidth = "350px"
    barProgress.style.height = "24px"
    barProgress.style.width = "350px"
    barProgress.style.borderRadius = "24px"
    barProgress.style.opacity = 1
    barProgress.style.background = "#F5FF65"
    barProgress.style.pointerEvents = "all"
    barText.style.opacity = 1
    settings.style.pointerEvents = "none"
    settings.style.opacity = 0
    changelog.style.pointerEvents = "none"
    changelog.style.opacity = 0
    updateProgress()
    updateMultiProgress()
}

GM_addStyle(`
@keyframes blink {
    0% {color: #DBD74B}
    50% {color: #1FDBDE}
    100% {color: #DBD74B}
}

.blink {
    animation-name: blink;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
}

::-webkit-scrollbar {
    width: 5px;
}
::-webkit-scrollbar-track {
    background: #00000000;
}
::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover {
    background: #444;
}
`)
