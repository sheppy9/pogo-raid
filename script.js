const dataUrl = "https://raw.githubusercontent.com/sheppy9/pokemon-go/master/data/json/individual_pokemon.json";
const searchInput = document.getElementById("search");

// Configure cache expiry time in seconds
const cacheExpirySeconds = 24 * 60 * 60; //24 hours
const localStorageKey = 'pokemonData';
const localStorageExpiryKey = 'pokemonDataExpiry';

let pokemonData = [];

$(document).ready(function() {
    let table = $('#pokemonTable').DataTable({
        data: [],
        dom: 'tipr',
        columns: [
            { data: 'name' },
            { data: null, render: function(data, type, row) {
                return `<button class="waves-effect waves-light btn" onclick="copyToClipboard(\'${row.search.replace(/'/g, "\\'")}\' )">Copy search phrase</button>`;
            }}
        ],
        pageLength: 10
    });

    // Function to load data from local storage
    function loadDataFromLocalStorage() {
        const storedData = localStorage.getItem(localStorageKey);
        const expiryTime = localStorage.getItem(localStorageExpiryKey);

        if (storedData && expiryTime) {
            const now = new Date().getTime();
            if (now < expiryTime) {
                pokemonData = JSON.parse(storedData);
                table.clear();
                table.rows.add(pokemonData);
                table.draw();
                return true;
            }
        }
        return false;
    }

    // Function to fetch data from the API and store it in local storage
    function fetchDataAndStoreInLocalStorage() {
        fetch(dataUrl)
            .then(response => response.json())
            .then(data => {
                pokemonData = data;
                table.clear();
                table.rows.add(pokemonData);
                table.draw();

                // Store the data in local storage with an expiry timestamp
                localStorage.setItem(localStorageKey, JSON.stringify(pokemonData));
                const now = new Date().getTime();
                const expiryTime = now + cacheExpirySeconds * 1000;
                localStorage.setItem(localStorageExpiryKey, expiryTime);
            });
    }

    // Try loading data from local storage first
    if (!loadDataFromLocalStorage()) {
        // If data is not in local storage or has expired, fetch it from the API
        fetchDataAndStoreInLocalStorage();
    }

   searchInput.addEventListener('input', function(e) {
        const searchTerm = this.value.toLowerCase();
        const filteredData = pokemonData.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm)
        );

        table.clear();
        table.rows.add(filteredData);
        table.draw();
    });

    document.getElementById('reloadButton').addEventListener('click', function() {
        fetchDataAndStoreInLocalStorage();
        searchInput.value = '';
    });
});


function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            M.toast({ html: 'Copied to clipboard!', classes: 'green rounded', displayLength: 3000});
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            M.toast({ html: 'Failed to copy!', classes: 'red rounded'});
        });
}
