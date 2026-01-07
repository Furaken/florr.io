// ==UserScript==
// @name        florr.io Content Downloader
// @namespace   https://florr.io
// @version     1.0.0
// @icon        https://florr.io/favicon-32x32.png
// @author      k2r_n2iq, samerkizi
// @match       https://florr.io/
// @grant       unsafeWindow
// @require     https://cdn.jsdelivr.net/npm/jszip@3.9.1/dist/jszip.min.js
// @run-at      document-start
// ==/UserScript==

await new Promise((resolve) => {
    const intervalID = setInterval(() => {
        if (typeof unsafeWindow.florrio !== "undefined") {
            clearInterval(intervalID);
            resolve();
        }
    }, 100)
    })

const rarities = ["common", "unusual", "rare", "epic", "legendary", "mythic", "ultra", "super", "unique"],
      petals = [
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
          "Mysterious Stick",
          "Clover",
          "Mysterious Powder",
          "Air",
          "Basil",
          "Orange",
          "Ant Egg",
          "Poo",
          "Mysterious Relic",
          "Lotus",
          "Light Bulb",
          "Cotton",
          "Carrot",
          "Bone",
          "Plank",
          "Tomato",
          "Dark Mark",
          "Rubber",
          "Blood Stinger",
          "Bur",
          "Root",
          "Ankh",
          "Dice",
          "Talisman of Evasion",
          "Battery",
          "Amulet",
          "Compass",
          "Disc",
          "Shovel",
          "Coin",
          "Poker Chip",
          "Card",
          "Moon Rock",
          "Privet Berry",
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
          "Magic Stick",
          "Coral",
          "Magic Bubble",
          "Nazar Amulet",
          "Mimic"
      ], mobs = [
          "rock",
          "cactus",
          "ladybug",
          "bee",
          "ant_baby",
          "ant_worker",
          "ant_soldier",
          "ant_queen",
          "ant_hole",
          "beetle",
          "hornet",
          "centipede",
          "centipede_body",
          "centipede_evil",
          "centipede_evil_body",
          "centipede_desert",
          "centipede_desert_body",
          "square",
          "ladybug_dark",
          "ladybug_shiny",
          "spider",
          "scorpion",
          "fire_ant_soldier",
          "fire_ant_burrow",
          "sandstorm",
          "bubble",
          "bumble_bee",
          "shell",
          "starfish",
          "crab",
          "jellyfish",
          "digger",
          "sponge",
          "leech",
          "leech_body",
          "dandelion",
          "fire_ant_baby",
          "fire_ant_worker",
          "fire_ant_queen",
          "ant_egg",
          "fire_ant_egg",
          "fly",
          "leafbug",
          "mantis",
          "termite_baby",
          "termite_worker",
          "termite_soldier",
          "termite_overmind",
          "termite_mound",
          "termite_egg",
          "bush",
          "roach",
          "moth",
          "firefly",
          "beetle_hel",
          "wasp",
          "dummy",
          "spider_hel",
          "centipede_hel",
          "centipede_hel_body",
          "wasp_hel",
          "trader",
          "gambler",
          "oracle",
          "firefly_magic",
          "titan",
          "beetle_nazar",
          "worm",
          "worm_guts",
          "mecha_flower"
      ],
      size = 1080

function downloadBinary(name, buffer) {
    const blob = new Blob([buffer], {
        type: "application/octet-stream"
    })
    const url = URL.createObjectURL(blob)

    const anchorElement = document.createElement("a")
    anchorElement.href = url
    anchorElement.download = name
    anchorElement.click()

    URL.revokeObjectURL(url)
}

const runAt = {
    mob: [61, 69], // 69
    petal: [61, 92] // 92
}

const script = document.createElement('script')
script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
document.head.appendChild(script)
script.onload = async () => {
    const zip = new JSZip();
    ["background", "no_background"].forEach((k, i) => {
        for (let r = 0; r < rarities.length; r++) {
            for (let p = 0; p < petals.length; p++) {
                if (runAt.petal[0] <= p && p <= runAt.petal[1]) {
                    const path = `${k}/petal/${rarities[r]}/${petals[p]}.png`
                    zip.file(path, unsafeWindow.florrio.utils.generatePetalImage(size, p + 1, r, i + 1).split(",")[1], { base64: true })
                    console.log("[florr.io]", path)
                }
            }
            for (let m = 0; m < mobs.length; m++) {
                if (runAt.petal[0] <= m && m <= runAt.petal[1]) {
                    const path = `${k}/mob/${rarities[r]}/${mobs[m]}.png`
                    zip.file(path, unsafeWindow.florrio.utils.generateMobImage(size, m + 1, r, i + 1).split(",")[1], { base64: true })
                    console.log("[florr.io]", path)
                }
            }
        }
    })

    const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    }, (metadata) => {
        console.log("[JSZip]", "progression: " + metadata.percent.toFixed(2) + " %")
    })
    downloadBinary("image.zip", content)
}