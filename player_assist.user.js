// ==UserScript==
// @name         Attack call for help
// @namespace    Violentmonkey Scripts
// @match        https://www.torn.com/loader.php?sid=attack&user2ID=*
// @version      0.3
// @author       rDacted[2670953]
// @description  Adds a 'request for assistance' button to the attack page
// @grant        GM_xmlhttpRequest
// @connect      torn.rocks
// @connect      *
// ==/UserScript==

let server = "https://torn.rocks/api/player_assistance";

var apikey = '###PDA-APIKEY###';
let universalPost = null;
if (apikey[0] != '#') {
    console.log("Using TornPDA version");
    universalPost = PDA_httpPost;
} else {
    console.log("Using GM_xmlhttpRequest version")
    universalPost = function(url, headers, body) {
        return new Promise(function(resolve, reject) {
            GM_xmlhttpRequest({
                method: "POST",
                url: url,
                headers: headers,
                data: body,
                onload: function(response) {
                    if(response.status == 200) {
                        resolve(response);
                    } else {
                        console.log(response.status);
                        reject(Error(response));
                    }
                },
                onabort: function(response) { console.log("onabort"); reject(Error(response)); },
                onerror: function(response) { console.log("onerror"); reject(Error(response)); },
                ontimeout: function(response) { console.log("ontimeout"); reject(Error(response)); },
            });
        });
    };
}

function ask_for_help(indicator) {
    // Set button to yellow while the request is active
    indicator.style.backgroundColor = "yellow";

    let target_id = window.location.search.match(/user2ID=\d+/);
    if(target_id != null) {
        target_id = target_id[0].split("=")[1];
    }

    let react_root = document.getElementById("react-root");
    let info = {reactroot: react_root.innerHTML, target: target_id};
    let data = JSON.stringify(info);
    let headers = {"Content-Type": "application/json"};

    universalPost(server, headers, data).then(
        resolve => {
                indicator.style.backgroundColor = "green";
            },
            error => {
                indicator.style.backgroundColor = "red";
            });
}

function create_div() {
    let target = document.getElementsByClassName('playersModelWrap___h62rQ');
    if(target.length == 1) {
        target = target[0];

        let firstChild = target.firstChild;
        const div1 = document.createElement("div");
        div1.setAttribute("style", "text-align: center; border: 4px solid");
        target.insertBefore(div1, firstChild);

        return div1;
    } else {
        console.log("Could not find players model wrap");
    }
}

function add_button() {
    let new_div = create_div();
    if(new_div != null) {
        //console.log(new_div);

        let btn = document.createElement("button");
        btn.setAttribute("style", "font-weight:bold;");
        btn.classList.add('wrap___OzSz_');
        btn.innerHTML = "CALL FOR EMERGENCY FACTION ASSISTANCE";
        btn.onclick = function () {
            ask_for_help(new_div);
        };
        new_div.appendChild(btn);
    }
}

function start() {
    console.log("Attack helper starting");
    add_button();
    console.log("Attack helper done");
}

// TODO
// This delay is needed as the div we search for isn't created until some point in the future
// There needs to be a better way to handle this - since this is quite long
setTimeout(function() { start(); }, 5000);
