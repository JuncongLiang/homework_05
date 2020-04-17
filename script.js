//Declare variables
var searchResult = $("#searchResult");
var searchHistory = $("#searchHistory");
var openWeather = "https://api.openweathermap.org/data/2.5/";
var apiId = "&appid=56da722b8ff34ce6426e8a77e1793729";
var searchHistoryList;
var cityName;

checkLocalStorage();

//Search button
$("#searchButton").on("click", function () {
    //Get city name from input
    cityName = $("#cityName").val().trim();
    localStorage.setItem("lastSearch", cityName);
    addCityToSearchHistory(cityName);
    $("#cityName").val("");
    printWeatherInfo(cityName);
});


//Identify user's location
$("#getLocationButton").on("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (response) {
            var queryURL = openWeather + "weather?lat=" + response.coords.latitude + "&lon=" + response.coords.longitude + apiId;
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                searchResult.empty();
                remove_dnone_class($("#weatherInfo"));
                searchResult.append("<h4>" + response.name + " (" + moment().utc().add(response.timezone, 'seconds').format("LLL") + ")<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png' alt='weather icon'></h4>");
                searchResult.append("<p>Temperature: " + Math.round((response.main.temp - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
                searchResult.append("<p>Humidity: " + response.main.humidity + "%</p>");
                searchResult.append("<p>Wind Speed: " + response.wind.speed + " MPH</p>");
                getUV(response.coord.lat, response.coord.lon);
                cityName = response.name;
                addCityToSearchHistory(cityName);
                localStorage.setItem("lastSearch", cityName);
                forecast(response.coord.lat, response.coord.lon);
            });
        });
    }
});

//Search history info
searchHistory.on("click", ".list-group-item", function () {
    printWeatherInfo($(this).attr("city"));
});

//Last search city info
function checkLocalStorage() {
    var previousSearchHistory = localStorage.getItem("lastSearch");
    if (previousSearchHistory !== null) {
        printWeatherInfo(previousSearchHistory);
    }
}

//Remove d-none class to display the content
function remove_dnone_class(remove) {
    if (remove.hasClass("d-none")) {
        remove.removeClass("d-none");
    }
}

//Get city name and weather info
function printWeatherInfo(cityName) {
    var queryURL = openWeather + "weather?&q=" + cityName + apiId;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        searchResult.empty();
        remove_dnone_class($("#weatherInfo"));
        searchResult.append("<h4>" + response.name + " (" + moment().utc().add(response.timezone, 'seconds').format("LLL") + ")<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png' alt='weather icon'></h4>");
        searchResult.append("<p>Temperature: " + Math.round((response.main.temp - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
        searchResult.append("<p>Humidity: " + response.main.humidity + "%</p>");
        searchResult.append("<p>Wind Speed: " + response.wind.speed + " MPH</p>");
        getUV(response.coord.lat, response.coord.lon);
        forecast(response.coord.lat, response.coord.lon);
    });
}

//Add city to search history
function addCityToSearchHistory(cityName) {
    var addSearchHistory = $("<li>");
    addSearchHistory.addClass("list-group-item");
    addSearchHistory.text(cityName);
    addSearchHistory.attr("city", cityName);
    searchHistory.prepend(addSearchHistory);
    remove_dnone_class(searchHistory.parent());
    
//When history list is too long, delete oldest search history
    if (document.getElementById("searchHistory").getElementsByTagName("li").length == 10) {
        searchHistory.find(":last-child").remove();
    }
}

//Get city location and UV index
function getUV(lat, lon) {
    var queryURL = openWeather + "uvi?lat=" + lat + "&lon=" + lon + apiId;
    $.ajax({
        url: queryURL,
        moethod: "GET"
    }).then(function (response) {
        var uvValue = response.value;
        searchResult.append("<p>UV index: <span id='uvColor'>" + uvValue + "</span></p>");
        var uvColor = $("#uvColor");
        if (uvValue < 3) {
            uvColor.css("background-color", "green");

        } else if (uvValue < 6) {
            uvColor.css("background-color", "yellow");
            uvColor.css("color", "black");

            uvColor.css("background-color", "orange");
            uvColor.css("color", "black");

        } else if (uvValue < 11) {
            uvColor.css("background-color", "red");

        } else if (uvValue > 11) {
            uvColor.css("background-color", "violet");

        }
    });
}

function forecast(lat, lon) {
    var queryURL = openWeather + "onecall?lat=" + lat + "&lon=" + lon + apiId;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        for (i = 1; i < 6; i++) {
            var forecastCard = "[value=" + i + "]";
            $(forecastCard).empty();
            $(forecastCard).append(moment.unix(response.daily[i].dt).format("LL"));
            $(forecastCard).append("<p><img src='http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + ".png' alt='weather icon'></p>");
            $(forecastCard).append("<p>Temp: " + Math.round((response.daily[i].temp.day - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
            $(forecastCard).append("<p>Humidity: " + response.daily[i].humidity + "%</p>");
        }
        console.log(response);
    });
}
