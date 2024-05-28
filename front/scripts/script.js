
/* Animations */
(()=>{
    let rows_collection = document.getElementsByClassName('game_row');
    console.log(rows_collection);
})();

/* ----------- */


const gameboard = (
    ()=>{            
        let wordBank = ['apple', 'bread', 'chair', 'dream', 'eagle', 'flame', 'grape', 'house', 'inbox', 'joker', 
        'knife', 'lemon', 'melon', 'night', 'ocean', 'piano', 'queen', 'raven', 'sheep', 'tiger', 'uncle', 'voice', 
        'water', 'xenon', 'yacht', 'zebra'];
    
        /* Local Storage */
        function initStorage(key, defaultValue){
            if( !(localStorage.getItem(key)) ){
                localStorage.setItem(key, defaultValue);
                return localStorage.getItem(key);
            }
            else{
                return localStorage.getItem(key);
            }
        }

        async function getRandomWord(wordBank) {
            // From 0 to 2308 there are more common words
            // let index = Math.floor(Math.random() * 2308);
            // return wordBank[index];

            try {
                const response = await fetch("https://wordle-clone-project-back.vercel.app/word");
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data);
                return data.word;
              } catch (error) {
                console.error("Fetch error:", error);
              }
            
        }

        let currentRow = 0;
        let currentColumn = 0;
        let gameState = initStorage('gameState', 'running');
        let recordObj =  {0:[null,null,null,null,null,''],1:[null,null,null,null,null,''],2:[null,null,null,null,null,''],3:[null,null,null,null,null,''],4:[null,null,null,null,null,''],5:[null,null,null,null,null,'']};
        let record = initStorage('record', JSON.stringify(recordObj));
        let played = initStorage('played', 0);
        let wins = initStorage('wins', 0);
        let streakCurrent = initStorage('streakCurrent', 0);
        let streakMax = initStorage('streakMax', 0);
        let distributionObj = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0}
        let distribution = initStorage('distribution', JSON.stringify(distributionObj));
        let lastMatchedRow = initStorage('lastMatchedRow', 6);
        let lastWord = initStorage('lastWord','');
        let wordle = null;


        let wordle_promise = getRandomWord(wordBank);
        wordle_promise.then((word)=>{
            wordle = initStorage('wordle', word);
            console.log("EXECUTE LINEA 66")
        })

        // wordle = 'tasty';

        /* DOM */
        let popupMessage = document.getElementById('popup_message');
        let messageActive = false;
        
        let userInput = document.createElement('input');
        userInput.type = 'text';

        let keyboard_collection = document.getElementsByClassName('keyboard_key');
        let gameboard = document.getElementById('game_table').children;

        let stat_wins = document.getElementById('stat_wins');
        let stat_played = document.getElementById('stat_played');
        let stat_max_streak = document.getElementById('stat_max_streak');
        let stat_current_streak = document.getElementById('stat_current_streak');
        let stats_chart_collection = document.getElementById('stats_chart').children;

        // Load stats
        renderStats();

        // Load record
        (()=>{
            let loadRecord = localStorage.getItem('record');
            loadRecord = JSON.parse(loadRecord);
            for (let index = 0; index < 6; index++) {
                if(loadRecord[index][5] !== ''){
                    gameboard[currentRow].children[0].innerText = loadRecord[currentRow][5][0].toUpperCase();
                    gameboard[currentRow].children[1].innerText = loadRecord[currentRow][5][1].toUpperCase();
                    gameboard[currentRow].children[2].innerText = loadRecord[currentRow][5][2].toUpperCase();
                    gameboard[currentRow].children[3].innerText = loadRecord[currentRow][5][3].toUpperCase();
                    gameboard[currentRow].children[4].innerText = loadRecord[currentRow][5][4].toUpperCase();
                    userInput.value = loadRecord[currentRow][5];
                    enterWord();
                }
            }
            if(currentRow>5){
                setTimeout(() => {
                    document.getElementById('popup_container_stats').style.display = 'block';
                }, 1100 );
            }
        })();

        function pressKey(key){
            if(currentRow<6 && currentRow>-1 && gameState !== 'over'){

                key = key.toLowerCase();
                let keyboard = ['q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m','enter','backspace']
                
                if(keyboard.includes(key)){
                    if(key === 'enter'){
                        // *** check if word is valid, if true, proced to next row + save statistics
                        enterWord();
                        if(currentRow>=6){
                            gameOver();
                        }
                    }
                    if(key === 'backspace'){
                        deleteLetter();
                    }
                    if( (key !== 'enter') && (key !== 'backspace') && (userInput.value.length < 5) ){
                        userInput.value = userInput.value + key;
                        renderLetter(key);
                    }
                }

            }
        }

        function gameOver(){
            if(gameState !== 'over'){
                if(currentRow > 5){
                    localStorage.setItem('streakCurrent', 0);
                    renderMessage(wordle.toUpperCase(),-1);
                }
                if(currentRow <= 5){
                    distribution = localStorage.getItem('distribution');
                    distribution = JSON.parse(distribution);
                    distribution[currentRow] = parseInt(distribution[currentRow])+1;
                    localStorage.setItem('distribution', JSON.stringify(distribution));

                    localStorage.setItem('wins', parseInt(wins)+1);
                    localStorage.setItem('streakCurrent', parseInt(streakCurrent)+1);

                    if(parseInt(streakMax) < parseInt(streakCurrent)+1){
                        localStorage.setItem('streakMax', parseInt(streakCurrent)+1);
                    }

                    switch (currentRow) {
                        case 0:
                            renderMessage('Genius');
                            break;
                        case 1:
                            renderMessage('Magnificent');
                            break;
                        case 2:
                            renderMessage('Impressive');
                            break;
                        case 3:
                            renderMessage('Splendid');
                            break;
                        case 4:
                            renderMessage('Great');
                            break;
                        case 5:
                            renderMessage('Phew');
                            break;
                    
                        default:
                            break;
                    }
                    // Phew Great Splendid Impressive Magnificent Genius

                }

                localStorage.setItem('played', parseInt(played)+1);
                localStorage.setItem('lastMatchedRow', getRow());
            }
            
            localStorage.setItem('gameState','over');
            gameState = 'over';
            
            renderStats();
            setTimeout(() => {
                document.getElementById('popup_container_stats').style.display = 'block';
            }, 1100 );
        }

        function renderLetter(key){
            gameboard[currentRow].children[userInput.value.length-1].innerText = key.toUpperCase();
            gameboard[currentRow].children[userInput.value.length-1].className = 'letterInserted'
        }
        
        function deleteLetter(){
            if(userInput.value.length > 0){
                gameboard[currentRow].children[userInput.value.length-1].innerText = '';
                userInput.value = userInput.value.slice(0,getColumn()-1);
                gameboard[currentRow].children[userInput.value.length].className = '';
            }
        }

        function enterWord(){
            if(getColumn() === 5){
                if(wordBank.includes(userInput.value)){
                    // *** add statistics to local storage
                    
                    let word = wordle.split('');
                    let letterAmount = [0, 0, 0, 0, 0];
                    let letterStatus = ['unincluded', 'unincluded', 'unincluded', 'unincluded', 'unincluded'];

                    // add matched status and count letters
                    for (let index = 0; index < 5; index++) {
                        
                        if(userInput.value[index] === word[index]){
                            letterStatus[index] = 'matched';
                        }

                        for (let index2 = 0; index2 < 5; index2++) {
                            if(word[index] === word[index2]){
                                letterAmount[index] = letterAmount[index] + 1;
                            }
                        }
                        
                    }

                    // substract letter count on matched letters
                    for (let index = 0; index < 5; index++) {

                        let letter = '';

                        if(letterStatus[index] === 'matched'){
                            letter = word[index];
                        }

                        for (let index2 = 0; index2 < 5; index2++) {
                            if(word[index2] === letter){
                                letterAmount[index2] = letterAmount[index2] - 1;
                            }
                        }

                    }
                    
                    // add included status
                    for (let index = 0; index < 5; index++) {
                        let currentLetter = userInput.value[index];

                        for (let index2 = 0; index2 < 5; index2++) {
                            if( currentLetter === word[index2] && letterAmount[index2] > 0 && letterStatus[index] !== 'matched'){

                                // Substract letter amount on 'included' letter
                                for (let index3 = 0; index3 < 5; index3++) {
                                    if(currentLetter === word[index3]){
                                        letterAmount[index3] = letterAmount[index3] - 1;
                                    }
                                }
                                
                                letterStatus[index] = 'included';

                            }
                        }
                    }

                    // save record to local storage
                    for (let index = 0; index < 5; index++) {
                        recordObj[currentRow][index] = letterStatus[index];
                    }
                    recordObj[currentRow][5] = userInput.value;
                    localStorage.setItem('record',JSON.stringify(recordObj));
                       
                    // add html class to DOM letters  
                    let spinDelay = 600/5;
                    let spinRow = currentRow;
                    let rowsCollection = document.getElementsByClassName('game_row');
                    for (let index = 0; index < 5; index++) {
                        setTimeout(() => {
                            rowsCollection[spinRow].children[index].className = letterStatus[index] + ' letterSpin';
                        }, spinDelay*index);
                    }
                    
                    for (let index = 0; index < 5; index++) {
                        let currentClass = document.getElementById(userInput.value[index]).className;
                        
                        if( letterStatus[index] === 'unincluded' && currentClass === 'keyboard_key' ){
                            document.getElementById(userInput.value[index]).className = 'keyboard_key '+letterStatus[index];
                        }
                        
                        if( letterStatus[index] === 'included' && currentClass !== 'keyboard_key matched' ){
                            document.getElementById(userInput.value[index]).className = 'keyboard_key '+letterStatus[index];
                        }
                        
                        if(letterStatus[index] === 'matched'){
                            document.getElementById(userInput.value[index]).className = 'keyboard_key '+letterStatus[index];
                        }
                    }

                    console.log(letterStatus)//------------
                    
                    if(userInput.value === wordle){
                        gameOver();
                        currentRow = setRow();
                    }
                    else{
                        currentRow = setRow();
                    }
                    userInput.value = '';
                }
                else{
                    renderMessage('Not in word bank');

                    document.getElementsByClassName('game_row')[currentRow].className = 'game_row wordError'
                    setTimeout(() => {
                        document.getElementsByClassName('game_row')[currentRow].className = 'game_row'
                    }, 500);
                }
            }
            else{
                renderMessage('5 Letters required');

                document.getElementsByClassName('game_row')[currentRow].className = 'game_row wordError'
                setTimeout(() => {
                    document.getElementsByClassName('game_row')[currentRow].className = 'game_row'
                }, 500);
            }
        }

        function renderMessage(message, timer = 1500){
            popupMessage.innerText = message;
            popupMessage.style.display = 'block';
            popupMessage.style.opacity = '100%';
            
            if(!messageActive && timer !== -1){
                setTimeout(()=>{
                    messageActive = false;
                    popupMessage.style.opacity = '0%';
                    popupMessage.style.display = 'block';
                },timer);
            }

            messageActive = true;
        }

        function renderStats(){
            
            stat_wins.innerText = Math.floor((parseInt(localStorage.getItem('wins'))/parseInt(localStorage.getItem('played')))*100);
            if(isNaN(stat_wins.innerText)){
                stat_wins.innerText = '0';
            }

            stat_played.innerText = localStorage.getItem('played');
            stat_max_streak.innerText = localStorage.getItem('streakMax');
            stat_current_streak.innerText = localStorage.getItem('streakCurrent');

            let statsDistribution = JSON.parse(localStorage.getItem('distribution'));
            let max=0;
            
            for (let index = 0; index < 6; index++) {
                if(statsDistribution[index]>max){
                    max = statsDistribution[index];
                }
            }
            
            let lastRow = parseInt(localStorage.getItem('lastMatchedRow'));
            for (let index = 0; index < 6; index++) {
                if(statsDistribution[index] === max){
                    stats_chart_collection[index].children[1].style.width = '100%'
                }
                else{
                    stats_chart_collection[index].children[1].style.width = `${(statsDistribution[index]/max)*100}%`;
                }

                stats_chart_collection[index].children[1].style.backgroundColor = '';
                if( lastRow > -1 && lastRow < 6){
                    stats_chart_collection[lastRow].children[1].style.backgroundColor = 'var(--color-background-7)';
                }

                stats_chart_collection[index].children[1].children[0].innerText = statsDistribution[index];
            }

        };



        // user input listeners
        for (let index = 0; index < keyboard_collection.length; index++) {
            let key = keyboard_collection[index].id;

            keyboard_collection[index].addEventListener('click', ()=>{
                pressKey(key);
            });

        }

        window.addEventListener('keydown', (e)=>{
            pressKey(e.key);
        });



        // setters
        function setRow(){
            // *** keep on logalstorage
            if(currentColumn<5){
                return currentRow +1;
            }
            else{
                return 6;
            }
        }

        // getters
        function getColumn(){
            if(userInput.value.length < 6){
                return userInput.value.length;
            }
            else{
                return 6;
            }
        }

        function getRow(){
            return currentRow;
        }

        function getRecord(){
            return record;
        }


        // export
        return {getColumn, getRow, getRecord, renderLetter, renderMessage}
    }
)();


/* ----------- */


/* Stats Popup */
let btn_stats = document.getElementById('btn_stats');
let popup_container_stats = document.getElementById('popup_container_stats');
let stats_close = document.getElementById('stats_close');

btn_stats.addEventListener('click', ()=>{
    popup_container_stats.style.display = 'block';
});

stats_close.addEventListener('click', ()=>{
    popup_container_stats.style.display = 'none';
});

popup_container_stats.addEventListener('click', (e)=>{
    if(e.target === e.currentTarget){
        popup_container_stats.style.display = 'none';
    }  
});

/* New Word Btn */
let change_word_btn = document.getElementById('change_word_btn');
change_word_btn.addEventListener('click',()=>{
    localStorage.removeItem('wordle');
    localStorage.removeItem('record');
    localStorage.removeItem('gameState');
    window.location.reload();
});

/* Info Popup */
let btn_info = document.getElementById('btn_info');
let popup_container_info = document.getElementById('popup_container_info');
let info_close = document.getElementById('info_close');

let example_matched = document.getElementById('example_matched');
let example_included = document.getElementById('example_included'); 
let example_unincluded = document.getElementById('example_unincluded');    

btn_info.addEventListener('click', ()=>{
    popup_container_info.style.display = 'flex';

    setTimeout(()=>{
        example_matched.className = 'matched letterSpin';
        example_included.className = 'included letterSpin';
        example_unincluded.className = 'unincluded letterSpin';
    },100);
});

info_close.addEventListener('click', ()=>{
    popup_container_info.style.display = 'none';

    example_matched.className = '';
    example_included.className = '';
    example_unincluded.className = '';
});



/* Settings Popup */
let btn_settings = document.getElementById('btn_settings');
let popup_container_settings = document.getElementById('popup_container_settings');
let settings_clsoe = document.getElementById('settings_close');

btn_settings.addEventListener('click', ()=>{
    popup_container_settings.style.display = 'flex';
});

settings_close.addEventListener('click', ()=>{
    popup_container_settings.style.display = 'none';
});

let dark_theme_btn = document.getElementById('dark_theme_btn');
let high_contrast_btn = document.getElementById('high_contrast_btn');
let root = document.documentElement;

dark_theme_btn.addEventListener('click', ()=>{
    if(dark_theme_btn.className.includes('switch_on')){
        dark_theme_btn.className = 'switch_container clickable';
        localStorage.setItem('colorTheme','l');
    }
    else{
        localStorage.setItem('colorTheme','d');
        dark_theme_btn.className = 'switch_container clickable switch_on';
    }
 
    applyColorTheme();
});

high_contrast_btn.addEventListener('click', ()=>{
    if( high_contrast_btn.className.includes('switch_on')){
        high_contrast_btn.className = 'switch_container clickable';
        localStorage.setItem('contrast','l');
    }
    else{
        high_contrast_btn.className = 'switch_container clickable switch_on';
        localStorage.setItem('contrast','h');
    }
 
    applyColorTheme();
});

function applyColorTheme(){
    if(dark_theme_btn.className.includes('switch_on')){
        root.style.setProperty('--mode','d');
        root.style.setProperty('--color-font-1','var(--color-font-1-d)');
        root.style.setProperty('--color-font-2','var(--color-font-2-d)');
        root.style.setProperty('--color-border-1','var(--color-border-1-d)');
        root.style.setProperty('--color-border-2','var(--color-border-2-d)');
        root.style.setProperty('--color-border-3','var(--color-border-3-d)');
        root.style.setProperty('--color-border-4','var(--color-border-4-d)');
        root.style.setProperty('--color-background-1','var(--color-background-1-d)');
        root.style.setProperty('--color-background-2','var(--color-background-2-d)');
        root.style.setProperty('--color-background-3','var(--color-background-3-d)');
        root.style.setProperty('--color-background-4','var(--color-background-4-d)');
        root.style.setProperty('--color-background-5','var(--color-background-5-d)');
        root.style.setProperty('--color-background-6','var(--color-background-6-d)');
        root.style.setProperty('--color-background-7','var(--color-background-7-d)');
    }
    else{
        root.style.setProperty('--mode','l');
        root.style.setProperty('--color-font-1','var(--color-font-1-l)');
        root.style.setProperty('--color-font-2','var(--color-font-2-l)');
        root.style.setProperty('--color-border-1','var(--color-border-1-l)');
        root.style.setProperty('--color-border-2','var(--color-border-2-l)');
        root.style.setProperty('--color-border-3','var(--color-border-3-l)');
        root.style.setProperty('--color-border-4','var(--color-border-4-l)');
        root.style.setProperty('--color-background-1','var(--color-background-1-l)');
        root.style.setProperty('--color-background-2','var(--color-background-2-l)');
        root.style.setProperty('--color-background-3','var(--color-background-3-l)');
        root.style.setProperty('--color-background-4','var(--color-background-4-l)');
        root.style.setProperty('--color-background-5','var(--color-background-5-l)');
        root.style.setProperty('--color-background-6','var(--color-background-6-l)');
        root.style.setProperty('--color-background-7','var(--color-background-7-l)');
    }

    if(high_contrast_btn.className.includes('switch_on')){
        root.style.setProperty('--color-background-5','var(--color-background-5-h)');
        root.style.setProperty('--color-background-6','var(--color-background-6-h)');
        root.style.setProperty('--color-background-7','var(--color-background-7-h)');
    }
}

// Load stored color settings
if( localStorage.getItem('contrast') === 'h' ){
    high_contrast_btn.className = 'switch_container clickable switch_on';
}
else{
    high_contrast_btn.className = 'switch_container clickable';
}

if( localStorage.getItem('colorTheme') === 'l' ){
    dark_theme_btn.className = 'switch_container clickable';
}
else{
    dark_theme_btn.className = 'switch_container clickable switch_on';
}

applyColorTheme();


