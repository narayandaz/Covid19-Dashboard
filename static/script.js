function stop_loading() {
    $('#preload').fadeOut('fast');
}
/*
$(window).on('load', function () {
    if (load_flag == 1) {
        $("#preload").fadeOut("fast");
    }
});
*/

$(document).ready(function () {
    var state_names = [];
    var total_confirmed = [];
    var total_active = [];
    var total_recovered = [];
    //const time_series_url = 'https://data.covid19india.org/v4/min/timeseries.min.json';
    const time_series_url = 'https://api.covid19tracker.in/data/static/timeseries.min.json';
    /* 
    Format:
    For States: https://data.covid19india.org/v4/min/timeseries-{state_code}.min.json 
    For India: https://data.covid19india.org/v4/min/timeseries.min.json
    */
    
    //const url = 'https://data.covid19india.org/v4/min/data.min.json'
    const url = 'https://api.covid19tracker.in/data/static/data.min.json';
    const date_url = 'https://api.covid19tracker.in/data/static/data/2023-03-03.min.json'
    
    const state_code = {
        'AN': 'Andaman and Nicobar', 'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh', 'AS': 'Assam', 'BR': 'Bihar', 'TT': 'Total',
        'CH': 'Chandigarh', 'CT': 'Chattisgarh', 'DL': 'Delhi', 'DN': 'Dadra and Nagar Haveli', 'GA': 'Goa', 'GJ': 'Gujarat',
        'HP': 'Himachal Pradesh', 'HR': 'Haryana', 'JH': 'Jharkhand', 'JK': 'Jammu and Kashmir', 'KA': 'Karnataka', 'KL': 'Kerala',
        'LA': 'Ladakh', 'LD': 'Lakshadweep', 'MH': 'Maharashtra', 'ML': 'Meghalaya', 'MN': 'Manipur', 'MP': 'Madhya Pradesh',
        'MZ': 'Mizoram', 'NL': 'Nagaland', 'OR': 'Odisha', 'PB': 'Punjab', 'PY': 'Puducherry', 'RJ': 'Rajasthan', 'SK': 'Sikkim',
        'TG': 'Telangana', 'TN': 'Tamil Nadu', 'TR': 'Tripura', 'UP': 'Uttar Pradesh', 'UT': 'Uttarakhand', 'WB': 'West Bengal'
    };



    /* Function that plots the time series data  */
    function plot_time_series_data(state, typeOfGraph, plotlyGraphDiv) {
        var urls;
        if (state == 'TT') {
            urls = 'https://api.covid19tracker.in/data/static/timeseries.min.json';
        }
        else {
            urls = 'https://api.covid19tracker.in/data/static/timeseries/' + state + '.min.json';
        }
        let date_range = []
        let confirmed_cases = []
        let deceased_cases = []
        let recovered_cases = []
        let active_cases = []
        let filter;
        let mode = 'lines';

        if (typeOfGraph == 'Cummulative') {
            filter = 'total';
        }
        else if (typeOfGraph == 'Daily') {
            filter = 'delta';
        }

        Plotly.d3.json(urls, function (figure) {
            let data = figure[state]['dates'];
            $.each(data, function (item) {
                //console.log(data[item]['total']);
                //console.log(item);
                date_range.push(item);
                confirmed_cases.push(data[item][filter]['confirmed']);
                deceased_cases.push(data[item][filter]['deceased']);
                recovered_cases.push(data[item][filter]['recovered']);
                //daily_cases.push(data[item][fil]['confirmed']);
                active_cases.push(data[item][filter]['confirmed'] - data[item][filter]['recovered'] - data[item][filter]['deceased'])
            });
            var trace1 = {
                x: date_range,
                y: confirmed_cases,
                marker: { color: 'blue' },
                mode: mode,
                name: 'Confirmed'
            }

            var trace2 = {
                x: date_range,
                y: deceased_cases,
                xaxis: 'x2',
                yaxis: 'y2',
                marker: { color: 'red' },
                mode: mode,
                name: 'Deceased'
            }

            var trace3 = {
                x: date_range,
                y: recovered_cases,
                xaxis: 'x3',
                yaxis: 'y3',
                marker: { color: 'green' },
                mode: mode,
                name: 'Recovered'
            }

            var trace4 = {
                x: date_range,
                y: active_cases,
                xaxis: 'x4',
                yaxis: 'y4',
                marker: { color: '#f05be8' },
                mode: mode,
                name: 'Active'
            }

            var layout = {
                grid: { rows: 2, columns: 2, pattern: 'independent' },
                title: 'COVID-19 | India' + ' (' + typeOfGraph + ')'
            };

            var config = { responsive: true, displayModeBar: false }

            Plotly.react(plotlyGraphDiv, [trace1, trace2, trace3, trace4], layout, config);

        });
    }

    // Sorting based on the confirmed cases of a state
    function sort_and_store(state_data, state_names, total_confirmed, total_active, total_recovered) {
        state_data.sort(function (a, b) {
            if (a[1] < b[1]) {
                return 1
            }
            else if (a[1] > b[1]) {
                return -1
            }
            return 0;
        });
        for (var i = 0; i < state_data.length; i++) {
            state_names.push(state_data[i][0]);
            total_confirmed.push(state_data[i][1]);
            total_active.push(state_data[i][2]);
            total_recovered.push(state_data[i][3]);
        }
        // Plots the bar-graph
        states_bar_chart(state_names, total_confirmed, total_active, total_recovered);
    }


    function fetch_data() {
        //console.log('Executed');
        $.getJSON(url, function (data) {
            var updated_date = data['TT']['meta']['last_updated'];
            // Adding the updated date
            x = updated_date.split('T');
            $('.updated_date').text(moment(updated_date).format('MMMM Do YYYY, h:mm:ss a') );
            var state_data = [];
            $.each(data, function (item) {
                /* Used in plotting Bar graphs */
                var total = data[item]['total'];
                if (item != 'TT') {
                    state_data.push([state_code[item], total['confirmed'], Math.abs(total['confirmed'] - total['deceased'] - total['recovered']), total['recovered']]);
                }


                // Total Cases
                var confirmed = total['confirmed'].toLocaleString('en-IN');
                var deceased = total['deceased'].toLocaleString('en-IN');
                var recovered = total['recovered'].toLocaleString('en-IN');
                var tested = total['tested'].toLocaleString('en-IN');
                //console.log(total);
                var total_vaccinated = (total['vaccinated1'] + total['vaccinated2']).toLocaleString('en-IN');
                // var vaccinated_1 = total['vaccinated1'].toLocaleString('en-IN');
                // var vaccinated_2 = total['vaccinated2'].toLocaleString('en-IN');
                var active = Math.abs(total['confirmed'] - total['deceased'] - total['recovered']);

                //total_pie_chart(total['recovered'], total['deceased'], active);

                // Today's Data
                var today_confirmed = 0;
                var today_deceased = 0;
                var today_recovered = 0;
                var today_vaccinated = 0;
                if (data[item].delta) {
                    today_confirmed = data[item]['delta']['confirmed'] == undefined ? 0 : data[item]['delta']['confirmed'].toLocaleString('en-IN');
                    today_deceased = data[item]['delta']['deceased'] == undefined ? 0 : data[item]['delta']['deceased'].toLocaleString('en-IN');
                    today_recovered = data[item]['delta']['recovered'] == undefined ? 0 : data[item]['delta']['recovered'].toLocaleString('en-IN');
                    today_vaccinated = data[item]['delta']['vaccinated'] == undefined ? 0 : data[item]['delta']['vaccinated'].toLocaleString('en-IN');

                    //console.log(item, data[item]['delta']);
                }
                if (item != 'TT') {
                    var row = '<tr><td><a class="state_name" href="' + item + '">' + state_code[item] + ' (' + item + ')</a>' + '</td><td>' + confirmed + '<small class="confirmed">(+' + today_confirmed + ')</small>' + '<td>' + active.toLocaleString('en-IN') + '</td>' + '</td>' + '<td>' + deceased + '<small class="deceased">(+' + today_deceased + ')</small>' + '</td><td>' + recovered + '<small class="recovered">(+' + today_recovered + ')</small>' + '</td><td>' + tested + '</td><td>' + total_vaccinated + '<small class="vaccinated">(+' + today_vaccinated + ')</small>' + '</td></tr>';
                }

                $('.main_table').append(row);
                //console.log(item, data[item]);

            });

            /* Appending the Total figures at the last */
            // Last 24 hours data
            var today_confirmed = data['TT']['delta']['confirmed'] == undefined ? 0 : data['TT']['delta']['confirmed'].toLocaleString('en-IN');
            var today_deceased = data['TT']['delta']['deceased'] == undefined ? 0 : data['TT']['delta']['deceased'].toLocaleString('en-IN');
            var today_recovered = data['TT']['delta']['recovered'] == undefined ? 0 : data['TT']['delta']['recovered'].toLocaleString('en-IN');
            var today_vaccinated = data['TT']['delta']['vaccinated'] == undefined ? 0 : data['TT']['delta']['vaccinated'].toLocaleString('en-IN');
            var today_tested = data['TT']['delta']['tested'] == undefined ? 0 : data['TT']['delta']['tested'].toLocaleString('en-IN');
            var today_active = Math.abs(data['TT']['total']['confirmed'] - data['TT']['total']['deceased'] - data['TT']['total']['recovered'] - data['TT']['total']['other']);

            // Total Cases of India -TT
            var TT_total_vaccines = (data['TT']['total']['vaccinated1'] + data['TT']['total']['vaccinated2']).toLocaleString('en-IN');
            var TT_confirmed = data['TT']['total']['confirmed'].toLocaleString('en-IN');
            var TT_deceased = data['TT']['total']['deceased'].toLocaleString('en-IN');
            var TT_recovered = data['TT']['total']['recovered'].toLocaleString('en-IN');
            var TT_tested = data['TT']['total']['tested'].toLocaleString('en-IN');
            var TT_vaccinated_1 = data['TT']['total']['vaccinated1'].toLocaleString('en-IN');
            var TT_vaccinated_2 = data['TT']['total']['vaccinated2'].toLocaleString('en-IN');
            var TT_population = data['TT']['meta']['population'];
            var TT_vaccine1_percentage = Math.round((data['TT']['total']['vaccinated1'] / TT_population) * 100);
            var TT_vaccine2_percentage = Math.round((data['TT']['total']['vaccinated2'] / TT_population) * 100);
            var TT_active = Math.abs(data['TT']['total']['confirmed'] - data['TT']['total']['deceased'] - data['TT']['total']['recovered'] - data['TT']['total']['other']);

            var row = '<tr style="background-color: lightyellow; font-weight: 700;"><td><a class="sticky-col first-col">' + state_code['TT'] + ' (' + 'TT' + ')</a>' + '</td><td>' + TT_confirmed + '<small class="confirmed">(+' + today_confirmed + ')</small></td><td>' + TT_active.toLocaleString('en-IN') + '</td>' + '<td>' + TT_deceased + '<small class="deceased">(+' + today_deceased + ')</small>' + '</td><td>' + TT_recovered + '<small class="recovered">(+' + today_recovered + ')</small>' + '</td><td>' + TT_tested + ' <small class="tested">(+' + today_tested + ')</small></td><td>' + TT_total_vaccines + '<small style="color: blue;">(+' + today_vaccinated + ')</small>' + '</td></tr>';
            $('.main_table').append(row);
            //console.log(data['TT']);
            /* Adding the Last 24 hours data */
            var prev_day = data['TT']['delta'];
            if (prev_day != undefined) {
                $('.confirmed_24 > h3').text(TT_confirmed);
                $('.confirmed_24 > small').text('(+' + prev_day['confirmed'].toLocaleString('en-IN') + ')');
                $('.deceased_24 > h3').text(TT_deceased);
                $('.deceased_24 > small').text('(+' + prev_day['deceased'].toLocaleString('en-IN') + ')');
                $('.recovered_24 > h3').text(TT_recovered);
                $('.recovered_24 > small').text('(+' + prev_day['recovered'].toLocaleString('en-IN') + ')');
                $('.active_24 > h3').text(TT_active.toLocaleString('en-IN'));
                //$('.active_24 > small').text('(+' + (Math.abs(prev_day['confirmed'] - prev_day['deceased'] - prev_day['recovered'])).toLocaleString('en-IN') + ')');
            }
            else {
                $('.confirmed_24 > h3').text(TT_confirmed);
                $('.deceased_24 > h3').text(TT_deceased);
                $('.recovered_24 > h3').text(TT_recovered);
                $('.active_24 > h3').text(TT_active.toLocaleString('en-IN'));

            }

            $('.total_doses').text(TT_total_vaccines);

            // Populating the first_dose statistics
            //$('#first_dose').text('One Dose: ' + TT_vaccinated_1);
            $('#first_dose_count').text(TT_vaccinated_1);
            $('#first_dose_progress').attr({"aria-valuenow": TT_vaccine1_percentage});
            $('#first_dose_progress').css("width", TT_vaccine1_percentage + '%');
            $('#first_dose_progress').text(TT_vaccine1_percentage + '%' );
            
            // Populating the second_dose statistics
            //$('#second_dose').text('Two Doses: ' + TT_vaccinated_2);
            $('#second_dose_count').text(TT_vaccinated_2);
            $('#second_dose_progress').attr({"aria-valuenow": TT_vaccine2_percentage});
            $('#second_dose_progress').css("width", TT_vaccine2_percentage + '%');
            $('#second_dose_progress').text(TT_vaccine2_percentage + '%' );
            // Hide loading.gif when JS is completely loaded.
            stop_loading();

            // Sort the data based on confirmed cases and plot the bar-graph
            sort_and_store(state_data, state_names, total_confirmed, total_active, total_recovered);
        });
        $('.footer > small').text('Source: ' + url);


    }

    function total_pie_chart(recovered, deceased, active) {
        var data = [{
            values: [recovered, deceased, active],
            labels: ['Recovered', 'Deceased', 'Active'],
            type: 'pie'
        }];

        var layout = {
            height: 400,
            width: 500,
            title: 'India Cases',
            autosize: true
        };
        Plotly.newPlot('totalPieDiv', data, layout);

    }

    function states_bar_chart(state_names, total_confirmed, total_active) {
        var trace1 = {
            x: state_names,
            y: total_confirmed,
            type: 'bar',
            name: 'Confirmed',
            marker: {
                color: 'rgb(10, 228, 240)',
                opacity: 0.7,
            }
        };

        var trace2 = {
            x: state_names,
            y: total_active,
            type: 'bar',
            name: 'Active',
            marker: {
                color: 'rgb(252, 111, 3)',
                opacity: 0.5
            }
        };

        var trace3 = {
            x: state_names,
            y: total_recovered,
            type: 'bar',
            name: 'Recovered',
            marker: {
                color: 'rgb(22, 111, 3)',
                opacity: 0.5
            }
        };

        var data = [trace1, trace3, trace2];

        var layout = {
            title: 'State wise Data',
            xaxis: {
                tickangle: -45
            },
            barmode: 'group'
        };

        var config = { responsive: true, displayModeBar: false, }

        Plotly.react('totalBarDiv', data, layout, config);

    }

    fetch_data();
    plot_time_series_data('TT', 'Cummulative', 'totalDiv');
    plot_time_series_data('TT', 'Daily', 'dailyDiv');
});
