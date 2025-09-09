"use strict";

(async () => {
    try {

        let intervalId = 0;
        const COINS_KEY_NAME = "chosenCoins"
        let chosenCoins = JSON.parse(localStorage.getItem(COINS_KEY_NAME)) || [];

        let COINSARR = [];
        const API_KEY = '40f4fa06d901c56d781e743499841a93a4e752795427977150a2a6f30fe3c5a6'
        const CACHE_AGE_IN_SECONDS = 2
        const myModal = new bootstrap.Modal(document.getElementById("myModal"));
        const searchBar = document.getElementById("search-bar");
        const about = document.getElementById("about-div");

        // const progressBarModal= new bootstrap.Modal(document.getElementById("progress-bar-modal"));
        const loader = document.getElementById("loader");

        const canvas = document.getElementById("myChart");

    

        const getData = async (url, apiKey) => {
            loader.style.display = "block";

            console.log(url);

            let data = localStorage.getItem(url);
            if (data) {
                data = JSON.parse(data);
                const { createdAt } = data;

                if ((new Date(createdAt).getTime() + CACHE_AGE_IN_SECONDS * 1000) > new Date().getTime()) {
                    console.log('cache hit');
                    loader.style.display = "none";
                    return data.data;
                }
            }

            const fetchedData = await fetch(url, {
                headers: { Authorization: `Bearer ${apiKey}` }
            }).then(response => response.json());

            localStorage.setItem(url, JSON.stringify({
                data: fetchedData,
                createdAt: new Date()
            }));

            console.log('cache miss');
            loader.style.display = "none";

            return fetchedData;
        };



        const calcDifferentPrices = (priceUsd, id) => {
            const ILS = priceUsd * 3.42;
            const EUR = priceUsd * 0.86;
            // Escape the content or use single quotes
            const retval = `Here is some extra info about ${id}:<br> USD: ${priceUsd} $<br> ILS: ${ILS} ₪<br> EUR: ${EUR} €`;
            return retval;
        };

        const renderTokens = coins => coins.map(({ id, symbol, priceUsd }) => `
    <div class="card coin-div m-2" style="width: 18rem;">
        <input id="switch-btn-${id}" class="form-check-input" type="checkbox" role="switch">  
        <h5 class="card-title">${symbol}</h5>    
        <p class="card-text">${id}</p>
           <button type="button" class="btn btn-primary btn-sm mt-2"
          data-bs-toggle="popover"
          data-bs-trigger="hover" 
          data-bs-placement="right"
          data-bs-content=" ${calcDifferentPrices(+priceUsd, id)}
          ">
          More Info
        </button>
    </div>
`).join("");







        const searchCoins = async () => {
            document.getElementById("home-div").innerHTML = "";
            loader.style.display = "block";

            const searchValue = document.getElementById("search-input").value;
            console.log(searchValue)
            const tokensSearch = await getData(`https://rest.coincap.io/v3/assets?search=${searchValue}`, API_KEY)
            // const coinsSearch = JSON.parse(tokensSearch.data).data
            let coinsSearch = Array.isArray(tokensSearch.data) ? tokensSearch.data : JSON.parse(tokensSearch.data).data;

            console.log(coinsSearch)
            //console.log(coins)
            const htmlSearch = renderTokens(coinsSearch);
            // console.log(htmlSearch)
            loader.style.display = "none";

            document.getElementById("home-div").innerHTML = htmlSearch;
        }

        const chooseFiveCoins = (e) => {
            e.preventDefault();
            const coinId = e.target.id.slice(11);
            const SelectedCoin = getCoinById(coinId)
            if (COINSARR.length >= 5 && e.target.checked) {
                e.target.checked = false;
            }

            else if (!e.target.checked) {

                COINSARR.pop(SelectedCoin);
            }

            else {

                COINSARR.push(SelectedCoin);
            }
        }

        const showSelectModal = (coins) => {
            const modalHTML = renderTokens(coins);
            document.getElementById("modal-container").innerHTML = modalHTML;
            popovers();

            myModal.show();
        }


        const getCoinById = (coinId) => {
            let coins = Array.isArray(TOTAL_COINS.data) ? TOTAL_COINS.data : JSON.parse(TOTAL_COINS.data).data;
            return coins.find(coin => coin.id === coinId);

        }

        const handleSwitchChange = e => {
            e.preventDefault();
            console.log(chosenCoins);
            const coinId = e.target.id.slice(11);
            const selectedCoin = getCoinById(coinId)
            // console.log(coinId)
            const coinExist = chosenCoins.find(coin => coin.id === selectedCoin.id)
            // console.log(coinExist)
            if (chosenCoins.length >= 5 && e.target.checked && !coinExist) {
                chosenCoins.push(selectedCoin);
                document.getElementById(`switch-btn-${selectedCoin.id}`).checked = false;
                showSelectModal(chosenCoins);
            }

            else if (!e.target.checked) {
                chosenCoins.pop(selectedCoin);
                localStorage.setItem(COINS_KEY_NAME, JSON.stringify(chosenCoins));
            }

            else if (!coinExist) {
                chosenCoins.push(selectedCoin);
                localStorage.setItem(COINS_KEY_NAME, JSON.stringify(chosenCoins));
            }
        };

        const setChosenCoins = () => {
            chosenCoins = COINSARR;
            localStorage.setItem(COINS_KEY_NAME, JSON.stringify(chosenCoins));
            loadCoins();
            COINSARR = [];
            myModal.hide();
            window.location.reload();


        }


        const renderCheckedSwitches = () => {

            chosenCoins.forEach(({ id }) => {
                document.getElementById(`switch-btn-${id}`).checked = true;
            })
        }

        const clearCanvas = () => {
            //  clearInterval(intervalId);
            const canvas = document.getElementById('myChart');
            const chart = Chart.getChart ? Chart.getChart(canvas) : null;
            if (chart) chart.destroy();
            // canvas.style.display = "none";
        }



        const popovers = () => {
            const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
            [...popoverTriggerList].forEach(el => new bootstrap.Popover(el, { html: true }));
        };


        const loadCoins = async () => {
            about.style.display = "none"
            searchBar.style.display = "block"
            canvas.style.display = "none";
            clearInterval(intervalId);
            let coins = Array.isArray(TOTAL_COINS.data) ? TOTAL_COINS.data : JSON.parse(TOTAL_COINS.data).data;
            console.log(coins)
            const html = renderTokens(coins);
            loader.style.display = "none"
            document.getElementById("home-div").innerHTML = html;
            popovers();
            renderCheckedSwitches();
            console.log('bye')

        }


        const colors = ['red', 'blue', 'green', 'yellow', 'orange'];
        const COINS = chosenCoins;
        const times = [];
        for (let i = 0; i < 4; i++) {
            times.push(new Date().toTimeString().slice(0, 8));
        }

        const showLiveReport = () => {
            chosenCoins = JSON.parse(localStorage.getItem(COINS_KEY_NAME)) || [];

            if (!chosenCoins) {
                alert("there are no coins")
            }
            document.getElementById("home-div").innerHTML = "";
            about.style.display = "none"
            searchBar.style.display = "none"
            loader.style.display = "block";

            //console.log(times);
            intervalId = setInterval(async () => {

                let counter = 0;
                let min = chosenCoins[0].priceUsd;
                let max = 0;

                const dataSet = chosenCoins.reduce((cumulative, coin) => {
                    const returnCoins = cumulative;



                    if (min > Number(coin.priceUsd)) {
                        min = Number(coin.priceUsd);
                    }


                    if (max < Number(coin.priceUsd)) {
                        max = Number(coin.priceUsd);
                    }


                    returnCoins.push(getALine(coin, counter));
                    counter++;


                    return returnCoins;
                }, [])



                clearCanvas();

                console.log("This runs every 5 seconds!");
                showGraph(dataSet, times, min, max);
            }, 5000);

        }


        const getALine = (coin, counter) => {
            return {
                label: coin.symbol,
                data: [coin.priceUsd, coin.priceUsd, coin.priceUsd, coin.priceUsd],
                borderColor: colors[counter],
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                fill: false,
                tension: 0
            };
        };



        const showGraph = (lines, times, min, max) => {


            let ctx = document.getElementById('myChart').getContext('2d');

            console.log(lines)
            console.log(min)

            console.log(max)


            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: times,
                    datasets: lines
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            title: { display: true, text: 'coin value' },
                            min: min - 50,
                            max: max + 50
                        },
                        x: {
                            title: { display: true, text: 'time' },
                        }

                    }

                }
            });
            loader.style.display = "none";
            canvas.style.display = "block";


        };
        const showAboutTab = () => {
            loader.style.display = "none";
            clearInterval(intervalId);
            canvas.style.display = "none"
            document.getElementById("home-div").innerHTML = "";

            about.style.display = "block";


        }
        const TOTAL_COINS = await getData('https://rest.coincap.io/v3/assets', API_KEY);
        // localStorage.removeItem(COINS_KEY_NAME);
        loadCoins();

        document.getElementById("home-div").addEventListener(("change"), handleSwitchChange);
        document.getElementById("search-input").addEventListener(("keyup"), searchCoins);
        document.getElementById("search-btn").addEventListener(("click"), searchCoins);
        document.getElementById("home-tab").addEventListener(("click"), loadCoins);
        document.getElementById("myModal").addEventListener(("change"), chooseFiveCoins)
        document.getElementById("submit-modal-btn").addEventListener(("click"), setChosenCoins);
        document.getElementById("live-report-tab").addEventListener(("click"), showLiveReport);
        document.getElementById("about-tab").addEventListener(("click"), showAboutTab)

    }
    catch (e) {
        console.log(e)
    }

})()