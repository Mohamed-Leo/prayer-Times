// catch all elements---------------------------------
const countryList = document.getElementById("country"),
        cityList = document.getElementById("city"),
        dateList = document.getElementById("date"),
        methodsList = document.getElementById("method"),
        countryCityLocation = document.querySelector('.country-city-location'),
        normalDate = document.querySelector('.normal-date'),
        hijriDate = document.querySelector('.hijri-date'),
        prayersBoxes = document.querySelector('.prayers-boxes');


// error variable to add it to the country span error if country is not available-------
let countrySpanError = document.getElementById('countrySpanError');


// when any input change the prayersTimes function will be called----------------
let inputs = document.querySelectorAll('.input');
inputs.forEach(input => {
    input.onchange = _ => prayersTimes();
});


// when open first--------------------------------------------------------------------------------------------------------------------
(function () {
    getCountries();
    getCountriesAndCites("Egypt");
    methods();
})();




// get countries----------------------------------
function getCountries() {
    // get countries--------------------
    let countryRequest = new Promise((resolve , reject) => {
        fetch('https://restcountries.com/v3.1/all')
        .then(response => {
            if(response.ok) resolve(response.json());
            else reject(`Error : can't fetch countries , status => ${response.status}`);
        })
    });

    countryRequest.then(countriesData => {
        countriesData.forEach(country => {
            // we need to avoid errors (there is no country named Israel)----------------------------------
            if(country.name.common != 'Israel') {
                countryList.innerHTML += `
                    <option value="${country.name.common}" ${country.name.common == "Egypt" ? 'selected' : ''}>${country.translations.ara.common}</option>
                `;
            }
        });
    })
    .catch(err => console.log(err));
}




// adding cities debend on country------------------------------
countryList.onchange = function () {
    getCountriesAndCites(this.value);
}

function getCountriesAndCites(country) {
    // get all cities from api by country--------------
    let countriesReuest = new Promise((resolve , reject) => {
        fetch("https://countriesnow.space/api/v0.1/countries")
        .then(response => {
            if(response.ok) resolve(response.json());
            else reject(`Error : fetching countries , status => ${response.status}`);
        })
    });

    countriesReuest.then(contriesData => {
        let countries = contriesData.data;
        // loop to get cites of a country and fill cityList-------
        countries.forEach(countryInfo => {
            if(country === countryInfo.country) {
                // clear cityList innerHtml before adding-----
                cityList.innerHTML = ``;
                // loop to get only max 300 city-----
                for(let i = 0; i <= 450; i++) {
                    if(countryInfo.cities[i]) {
                        cityList.innerHTML += `
                            <option value="${countryInfo.cities[i]}" ${countryInfo.cities[i] == "Cairo" ? 'selected' : ''}>${countryInfo.cities[i]}</option>
                        `;
                    }
                }

                prayersTimes();
            }
        });
    })
    .catch(err => console.log(err));
};





// get all methods-----------------
function methods() {
    let methodsRequest = new Promise((resolve , reject) => {
        fetch("https://api.aladhan.com/v1/methods")
        .then(response => {
            if(response.ok) resolve(response.json());
            else reject(`Error : can't fetch methodes , status => ${response.status}`);
        });
    });

    methodsRequest.then(methodsData => {
        // loop to add methods to methodsList----------------------
        let methods = methodsData.data;
        let methodsKeys = Object.keys(methods);

        for(let i = 0; i < methodsKeys.length; i++) {
            if(methods[methodsKeys[i]].name) {
                methodsList.innerHTML += `
                    <option value="${methods[methodsKeys[i]].id}" ${methodsKeys[i] == "EGYPT" ? 'selected' : ''}>${methods[methodsKeys[i]].name}</option>
                `;
            }

        }
    })
    .catch(err => console.log(err));
}



// prayersTimes function----------------------------------------------------------------
function prayersTimes() {
    // get inputs values----------------------------
    let country = countryList.value,
        city = cityList.value || "Cairo",
        date = dateList.value,
        method = methodsList.value || 5;

    // clear countrySpanError.innerText---------------------------
    countrySpanError.innerText = '';

        // change the date formate--------------------
        if(date) {
            date = `${dateList.value.split('-')[2]}-${dateList.value.split('-')[1]}-${dateList.value.split('-')[0]}`; 
        }

    // fetch to get prayers times----------------------
    let prayersRequest = new Promise((resolve , reject) => {
        fetch(`https://api.aladhan.com/v1/timingsByCity${date ? '/' + date : ''}?city=${city}&country=${country}&method=${method}`)
        .then(response => {
            if(response.ok) resolve(response.json());
            else reject(`Error : can't fetch prayers time data , status => ${response.status}`);
        });
    });

    prayersRequest.then(prayersTimesData => {
        // fill prayers times boxes and set the 12 hours formate---------------------
        // Fajr time--------
        document.querySelector('.fair-pray h4').innerHTML = prayersTimesData.data.timings.Fajr;
        document.querySelector('.fair-pray h4').dataset.prayTime = prayersTimesData.data.timings.Fajr;
        // Sunrise time--------
        document.querySelector('.sunrise-pray h4').innerHTML = prayersTimesData.data.timings.Sunrise;
        document.querySelector('.sunrise-pray h4').dataset.prayTime = prayersTimesData.data.timings.Sunrise;
        // Dhuhr time--------
        document.querySelector('.dahur-pray h4').innerHTML = `
            ${prayersTimesData.data.timings.Dhuhr.split(":")[1]}
            :
            ${
                prayersTimesData.data.timings.Dhuhr.split(":")[0] > 12 ? 
                "0" + prayersTimesData.data.timings.Dhuhr.split(":")[0] % 12 : 
                prayersTimesData.data.timings.Dhuhr.split(":")[0]
            }
        `;
        document.querySelector('.dahur-pray h4').dataset.prayTime = prayersTimesData.data.timings.Dhuhr;
        // Asr time--------
        document.querySelector('.assr-pray h4').innerHTML =  `
            ${prayersTimesData.data.timings.Asr.split(":")[1]}
            :
            ${
                prayersTimesData.data.timings.Asr.split(":")[0] > 12 ? 
                "0" + prayersTimesData.data.timings.Asr.split(":")[0] % 12 : 
                prayersTimesData.data.timings.Asr.split(":")[0]
            }
        `;
        document.querySelector('.assr-pray h4').dataset.prayTime = prayersTimesData.data.timings.Asr;
        // Maghrib time--------
        document.querySelector('.mahgrib-pray h4').innerHTML =  `
            ${prayersTimesData.data.timings.Maghrib.split(":")[1]}
            :
            ${
                prayersTimesData.data.timings.Maghrib.split(":")[0] > 12 ? 
                "0" + prayersTimesData.data.timings.Maghrib.split(":")[0] % 12 : 
                prayersTimesData.data.timings.Maghrib.split(":")[0]
            }
        `;
        document.querySelector('.mahgrib-pray h4').dataset.prayTime = prayersTimesData.data.timings.Maghrib;
        // Isha time--------
        document.querySelector('.issha-pray h4').innerHTML =`
            ${prayersTimesData.data.timings.Isha.split(":")[1]}
            :
            ${
                prayersTimesData.data.timings.Isha.split(":")[0] > 12 ? 
                "0" + prayersTimesData.data.timings.Isha.split(":")[0] % 12 : 
                prayersTimesData.data.timings.Isha.split(":")[0]
            }
            `;
        document.querySelector('.issha-pray h4').dataset.prayTime = prayersTimesData.data.timings.Isha;


        // change the periodTime in all pray-boxs-------------------------------------------
        let prayBoxes = document.querySelectorAll('.pray-box');
        prayBoxes.forEach(box => {
            // check on every hour to change the periodTime------
            if(box.children[1].dataset.prayTime.split(":")[0] >= 12) {
                box.children[2].innerText = 'Pm';
            }
            else {
                box.children[2].innerText = 'Am';
            }
        });

        // fill info-container with data and get then to hide the loader--------------
        fillInfoContainerData(country , city , prayersTimesData.data).then(_ => {
            // loader--------------------------
            $(document).ready(function () {
                $(".loader").fadeOut(1500);
            });
        }).catch(err => console.log(err));

    })
    .catch(err => {
        console.log(err);
        // update the countrySpanError variable-----------------
        countrySpanError.innerText = "this country is not available now";
    });
}



// fillInfoContainerData function----------------------------------------------------------------
function fillInfoContainerData(country , city , prayersData) {

    return new Promise((resolve , reject) => {
        if(country && city && prayersData) {
            // get all country list to get the arabic country arabic name-----------
            Array.from(countryList.children).forEach(countryOption => {
                if(countryOption.value == country) {
                    // update the country variable with the arabic country name-----
                    country = countryOption.innerHTML;
                }
            });

            countryCityLocation.innerHTML = `
                <h1>الدولة : ${country}</h1>
                <h2>المدينة : ${city}</h2>
            `;

            normalDate.innerHTML = `
                <h3>التاريخ الميلادي</h3>
                <h4>${prayersData.date.gregorian.date}</h4>
                <h4>اليوم : ${prayersData.date.hijri.weekday.ar}</h4>
                <h4>الشهر : ${prayersData.date.gregorian.month.number}</h4>
                <h4>السنة : ${prayersData.date.gregorian.year}</h4>
            `;

            hijriDate.innerHTML = `
                <h3>التاريخ الهجري</h3>
                <h4>${prayersData.date.hijri.date}</h4>
                <h4>اليوم :  ${prayersData.date.hijri.weekday.ar}</h4>
                <h4>الشهر :   ${prayersData.date.hijri.month.ar}</h4>
                <h4>السنة : ${prayersData.date.hijri.year}</h4>
            `;

            resolve();
        }
        else {
            reject("Error : can't fill info-container with data (bad resolve)");
        }
    });
};