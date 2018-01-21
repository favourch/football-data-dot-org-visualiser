// variable to hold api token
var api_token = "c7d15088276f47cb94d423cf484706ff";

// set headers
$.ajaxSetup({
    headers: {
        "X-Auth-Token": api_token
    }
});

// variable to hold competitions
var competitions = $("#competitions");
// variable to hold competition
var competition = $("#competition");
// variable to hold team
var team = $("#team");
// variable to hold player
var player = $("#player");

// variable to hold current competition id
var current_competition_id = 0;
// variable to hold current competition name
var current_competition_name = "";
// variable to hold current team id
var current_team_id = 0;
// variable to hold current team name
var current_team_name = "";
// variable to hold players
var players = [];

// function to get id
function get_id(url, index) {
    // return id
    return url.replace(/^https?:\/\//, '').split('/')[index];
}

// function to add player info
function add_player_info(data) {
    // variable to hold player info card body
    var player_info_card_body = $("#player-info").find(".card-body");

    // variable to hold contract years
    var contract_years = moment.duration(moment(data.contract).diff(moment())).years();
    // variable to hold contract months
    var contract_months = moment.duration(moment(data.contract).diff(moment())).months();

    // append content
    player_info_card_body.empty().append(
        "<dl class='row mb-0'>" +
        "<dt class='col-sm-2'>Name</dt>"           + "<dd class='col-sm-10'>" + data.name                                  + "</dd>" +
        "<dt class='col-sm-2'>Date of Birth</dt>"  + "<dd class='col-sm-10'>" + moment(data.dob).format("DD/MM/YYYY")      + " (" + moment().diff(data.dob, 'years') + " years old)</dd>" +
        "<dt class='col-sm-2'>Nationality</dt>"    + "<dd class='col-sm-10'>" + data.nationality                           + "</dd>" +
        "<dt class='col-sm-2'>Position</dt>"       + "<dd class='col-sm-10'>" + data.position                              + "</dd>" +
        "<dt class='col-sm-2'>Number</dt>"         + "<dd class='col-sm-10'>" + data.number                                + "</dd>" +
        "<dt class='col-sm-2'>Contract until</dt>" + "<dd class='col-sm-10'>" + moment(data.contract).format("DD/MM/YYYY") + " (" +
        (contract_years === 0 ? "" : contract_years + (contract_years > 1 ? " years " : " year " )) +
        (contract_months === 0 ? "" : contract_months + (contract_months > 1 ? " months " : " month " )) +
        " left)</dd>" +
        "</dl>"
    );
}

// function to build player page
function build_player_page(player_id) {
    // hide competitions
    competitions.hide();
    // hide competition
    competition.hide();
    // fade out team
    team.fadeOut();

    // set html
    $("#player-breadcrumb").find("a").html("Back to " + current_team_name);

    // add player info
    add_player_info(players[player_id]);

    // fade in player
    player.fadeIn();
}

// function to add team analysis
function add_team_analysis(team_info, team_players, team_fixtures) {
    // variable to hold team analysis canvas
    var team_analysis_canvas = $("#team-analysis").find(".card-body").find("#team-analysis-canvas");
    // append content
    team_analysis_canvas.empty().append(
        "<canvas id='nationalities-chart'></canvas>"
    );
    // variable to hold nationalities array
    var nationalities = [];
    // for each player
    $.each(team_players.players, function(key, val) {
        // add player nationality to nationalities array
        nationalities.push(val.nationality);
    });
    // variable to hold nationalities counts
    var nationalities_counts  = {};
    // for each nationality
    $.each(nationalities, function(key, val) {
        // apply logic
        if (!nationalities_counts.hasOwnProperty(val)) {
            nationalities_counts[val] = 1;
        } else {
            nationalities_counts[val]++;
        }
    });
    // variable to hold nationality keys array
    var nationality_keys = [];
    // variable to hold nationality values array
    var nationality_vals = [];
    // for each nationality count
    $.each(nationalities_counts, function(key, val) {
        // add key to nationality keys array
        nationality_keys.push(key);
        // add key to nationality values array
        nationality_vals.push(val);
    });
    // variable to hold ctx
    var ctx = document.getElementById("nationalities-chart").getContext('2d');
    // initialize chart
    var nationalities_chart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: nationality_keys,
            datasets: [{
                data: nationality_vals,
                backgroundColor: Please.make_color({ base_color: "DarkTurquoise", colors_returned: nationality_keys.length }),
                borderWidth: 1,
                borderColor: "#343a40"
            }]
        },
        options: {
            legend: {
                display: false
            },
            title: {
                display: true,
                fontSize: 16,
                fontFamily: "'Work Sans', sans-serif",
                fontColor: "#17a2b8",
                text: 'Nationalities'
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        color: "rgba(23, 162, 184, 0.2)",
                        zeroLineColor: "rgba(23, 162, 184, 0.2)"
                    },
                    ticks: {
                        fontFamily: "'Work Sans', sans-serif",
                        fontColor: "#17a2b8"
                    }
                }],
                xAxes: [{
                    gridLines: {
                        color: "rgba(23, 162, 184, 0.2)",
                        zeroLineColor: "rgba(23, 162, 184, 0.2)"
                    },
                    ticks: {
                        fontFamily: "'Work Sans', sans-serif",
                        fontColor: "#17a2b8",
                        beginAtZero: true,
                        userCallback: function(label, index, labels) {
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        }
                    }
                }]
            },
            responsive: true
        }
    });
    // show team analysis canvas
    team_analysis_canvas.show();
}

// function to get fixture result
function get_fixture_result(fixture) {
    // variable to hold result
    var result = "";
    // apply logic
    if (fixture.status === "IN_PLAY") {
        result += fixture.result.goalsHomeTeam + " - " + fixture.result.goalsAwayTeam;
    } else if ($.inArray(fixture.status, ["SCHEDULED", "TIMED", "POSTPONED"]) !== -1) {
        result += "-";
    } else if (fixture.status === "FINISHED") {
        result += "FT: " + fixture.result.goalsHomeTeam + " - " + fixture.result.goalsAwayTeam + "<br>";
        if (fixture.result.halfTime) {
            result += "HT: " + fixture.result.halfTime.goalsHomeTeam + " - " + fixture.result.halfTime.goalsAwayTeam + "<br>";
        }
        if (fixture.result.extraTime) {
            result += "ET: " + fixture.result.extraTime.goalsHomeTeam + " - " + fixture.result.extraTime.goalsAwayTeam;
        }
    }
    // return result
    return result;
}

// function to add fixtures
function add_fixtures(data, type) {
    // variable to hold fixtures tbody
    var fixtures_tbody = $();

    // empty selectors
    $("#competition-fixtures-in-play, #competition-fixtures-scheduled, #competition-fixtures-finished").find("tbody").empty();
    // empty selectors
    $("#team-fixtures-in-play, #team-fixtures-scheduled, #team-fixtures-finished").find("tbody").empty();

    // define variables
    var competition_fixtures_in_play = false; var competition_fixtures_scheduled = false; var competition_fixtures_finished = false;
    var team_fixtures_in_play = false; var team_fixtures_scheduled = false; var team_fixtures_finished = false;

    // for each fixture
    $.each(data.fixtures, function(key, val) {
        // apply logic
        if (type === "competition" && val.status === "IN_PLAY") { fixtures_tbody = $("#competition-fixtures-in-play").find("tbody"); competition_fixtures_in_play = true; }
        if (type === "competition" && val.status === "SCHEDULED") { fixtures_tbody = $("#competition-fixtures-scheduled").find("tbody"); competition_fixtures_scheduled = true; }
        if (type === "competition" && val.status === "FINISHED") { fixtures_tbody = $("#competition-fixtures-finished").find("tbody"); competition_fixtures_finished = true; }
        if (type === "team" && val.status === "IN_PLAY") { fixtures_tbody = $("#team-fixtures-in-play").find("tbody"); team_fixtures_in_play = true; }
        if (type === "team" && val.status === "SCHEDULED") { fixtures_tbody = $("#team-fixtures-scheduled").find("tbody"); team_fixtures_scheduled = true; }
        if (type === "team" && val.status === "FINISHED") { fixtures_tbody = $("#team-fixtures-finished").find("tbody"); team_fixtures_finished = true; }

        // variable to hold function parameters home
        var function_parameters_home = "\"" + get_id(val._links.homeTeam.href, 3) + "\"";
        // variable to hold function parameters away
        var function_parameters_away = "\"" + get_id(val._links.awayTeam.href, 3) + "\"";

        // append content
        fixtures_tbody.append(
            "<tr>" +
            "<td class='border-info align-middle'>" +
            moment(new Date(val.date)).format("DD/MM/YYYY<br>HH:mm") +
            "</td>" +

            "<td class='border-info align-middle'>" +
            "<a class='text-info' href='#' onclick='event.preventDefault(); build_team_page(" + function_parameters_home + ");'>" + val.homeTeamName + "</a>" +
            "</td>" +

            "<td class='border-info align-middle'>" +
            get_fixture_result(val) +
            "</td>" +

            "<td class='border-info align-middle'>" +
            "<a class='text-info' href='#' onclick='event.preventDefault(); build_team_page(" + function_parameters_away + ");'>" + val.awayTeamName + "</a>" +
            "</td>" +
            "</tr>"
        );
    });
    // apply logic
    if (type === "competition" && competition_fixtures_in_play === false) {
        $("#competition-fixtures-in-play").find(".table-responsive").hide();
        $("#competition-fixtures-in-play-error").html("There are currently no in-play fixtures for this competition.").show();
    }
    if (type === "competition" && competition_fixtures_scheduled === false) {
        $("#competition-fixtures-scheduled").find(".table-responsive").hide();
        $("#competition-fixtures-scheduled-error").html("There are no scheduled fixtures for this competition.").show();
    }
    if (type === "competition" && competition_fixtures_finished === false) {
        $("#competition-fixtures-finished").find(".table-responsive").hide();
        $("#competition-fixtures-finished-error").html("There are no finished fixtures for this competition.").show();
    }
    if (type === "team" && team_fixtures_in_play === false) {
        $("#team-fixtures-in-play").find(".table-responsive").hide();
        $("#team-fixtures-in-play-error").html("There are currently no in-play fixtures for this team.").show();
    }
    if (type === "team" && team_fixtures_scheduled === false) {
        $("#team-fixtures-scheduled").find(".table-responsive").hide();
        $("#team-fixtures-scheduled-error").html("There are no scheduled fixtures for this team.").show();
    }
    if (type === "team" && team_fixtures_finished === false) {
        $("#team-fixtures-finished").find(".table-responsive").hide();
        $("#team-fixtures-finished-error").html("There are no finished fixtures for this team.").show();
    }
}

// function to get team fixtures
function get_team_fixtures(team_id) {
    // return ajax data
    return $.ajax({ url: "http://api.football-data.org/v1/teams/" + team_id + "/fixtures" }).then(function(data) { return data }).catch(function(xhr) { return xhr.status });
}

// function to add team players
function add_team_players(team_players) {
    // empty selectors
    $("#goalkeepers, #defenders, #midfielders, #attackers").next().empty();

    // set variable to array
    players = [];

    // variable to hold player id
    var player_id = 1;

    // define variables
    var goalkeepers_count = 0; var defenders_count = 0; var midfielders_count = 0; var attackers_count = 0; var years_total = 0;

    // for each team player
    $.each(team_players.players, function(key, val) {
        // define player object
        var player = {
            name: val.name,
            dob: val.dateOfBirth,
            nationality: val.nationality,
            position: val.position,
            number: val.jerseyNumber,
            contract: val.contractUntil
        };
        // calculate player years old
        years_total += moment().diff(val.dateOfBirth, 'years');

        // apply logic
        if ((val.position === "Keeper")) {
            $("#goalkeepers").next().append(
                "<a class='btn btn-info bg-transparent text-info mt-0 mr-2 mb-2 ml-0' href='#' onclick='event.preventDefault(); build_player_page(" + "\"" + key + "\"" + ");'>" + val.name + "</a>"
            );
            goalkeepers_count += 1
        } else if ((val.position).indexOf("Back") >= 0) {
            $("#defenders").next().append(
                "<a class='btn btn-info bg-transparent text-info mt-0 mr-2 mb-2 ml-0' href='#' onclick='event.preventDefault(); build_player_page(" + "\"" + key + "\"" + ");'>" + val.name + "</a>"
            );
            defenders_count += 1
        } else if ((val.position).indexOf("Midfield") >= 0) {
            $("#midfielders").next().append(
                "<a class='btn btn-info bg-transparent text-info mt-0 mr-2 mb-2 ml-0' href='#' onclick='event.preventDefault(); build_player_page(" + "\"" + key + "\"" + ");'>" + val.name + "</a>"
            );
            midfielders_count += 1
        } else if ((val.position).indexOf("Wing") >= 0 || (val.position).indexOf("Forward") >= 0) {
            $("#attackers").next().append(
                "<a class='btn btn-info bg-transparent text-info mt-0 mr-2 mb-2 ml-0' href='#' onclick='event.preventDefault(); build_player_page(" + "\"" + key + "\"" + ");'>" + val.name + "</a>"
            );
            attackers_count += 1
        }
        // add player to players array
        players.push(player);
        // increment player id
        player_id += 1;
    });

    // set html
    $("#goalkeepers").html((goalkeepers_count === 1) ? goalkeepers_count + " Goalkeeper" : goalkeepers_count + " Goalkeepers");
    $("#defenders").html((defenders_count === 1)     ? defenders_count   + " Defender"   : defenders_count   + " Defenders");
    $("#midfielders").html((midfielders_count === 1) ? midfielders_count + " Midfielder" : midfielders_count + " Midfielders");
    $("#attackers").html((attackers_count === 1)     ? attackers_count   + " Attacker"   : attackers_count   + " Attackers");

    // append content
    $("#team-info").find(".mb-0").append(
        "<dt class='col-md-12 col-lg-3'>No. of players</dt>"  + "<dd class='col-md-12 col-lg-9'>" + team_players.count + "</dd>"
    );
    var average_age = (years_total / players.length).toFixed(2);
    $("#team-info").find(".mb-0").append(
        "<dt class='col-md-12 col-lg-3'>Average age</dt>"  + "<dd class='col-md-12 col-lg-9'>" + average_age + "</dd>"
    );
}

// function to get team players
function get_team_players(team_id) {
    // return ajax data
    return $.ajax({ url: "http://api.football-data.org/v1/teams/" + team_id + "/players" }).then(function(data) { return data }).catch(function(xhr) { return xhr.status });
}

// function to add team info
function add_team_info(team_info) {
    // variable to hold team info card body
    var team_info_card_body = $("#team-info").find(".card-body");
    // append content
    team_info_card_body.empty().append(
        "<div class='container'>" +
        "<div class='row'>" +
        "<div class='col-lg-3 text-center'>" +
        "<img src='" + team_info.crestUrl + "' onerror=\"this.src='http://via.placeholder.com/150x150'\" width='150px'/>" +
        "</div>" +
        "<div class='col-lg-9'>" +
        "<dl class='row mb-0'>" +
        "<dt class='col-md-12 col-lg-3'>Team name</dt>"       + "<dd class='col-md-12 col-lg-9'>" + team_info.name     + "</dd>" +
        "</dl>" +
        "</div>" +
        "</div>" +
        "</div>"
    );
}

// function to get team info
function get_team_info(team_id) {
    // return ajax data
    return $.ajax({ url: "http://api.football-data.org/v1/teams/" + team_id }).then(function(data) { return data }).catch(function(xhr) { return xhr.status });
}

// function to build team page
function build_team_page(team_id) {

    // hide competitions
    competitions.hide();
    // fade out competition
    competition.fadeOut();
    // hide player
    player.hide();

    // set html
    $("#team-breadcrumb").find("a").html("Back to " + current_competition_name);

    $.when(
        // get team info
        get_team_info(team_id),
        // get team players
        get_team_players(team_id),
        // get team fixtures
        get_team_fixtures(team_id)
    ).then(
        function(
            // variable to hold team info
            team_info,
            // variable to hold team players
            team_players,
            // variable to hold team fixtures
            team_fixtures
        ) {
            // set current team id
            current_team_id = team_id;
            // set current team name
            current_team_name = team_info.name;

            // set html
            $("#team-nav").find(".card-header").html(current_team_name);

            // add team info
            if ($.inArray(team_info, [400, 403, 404, 429]) !== -1) {
                $("#team-info").find(".card-body").html("The information is not available for this team.");
            } else {
                add_team_info(team_info);
            }
            // add team players
            if (($.inArray(team_players, [400, 403, 404, 429]) !== -1) || (team_players.players.length === 0)) {
                $("#team-players").find("dl, hr").hide();
                $("#team-players-error").html("The players are not available for this team.").show();
                $("#team-analysis-canvas").hide();
                $("#team-analysis-error").html("The analysis is not possible because the players are not available for this team.").show();
            } else {
                $("#team-players-error").hide();
                $("#team-players").find("dl, hr").fadeIn();
                add_team_players(team_players);
                $("#team-analysis-error").hide();
                add_team_analysis(team_info, team_players, team_fixtures);
            }

            // add team fixtures
            if ($.inArray(team_fixtures, [400, 403, 404, 429]) !== -1) {
                $("#team-fixtures-in-play, #team-fixtures-scheduled, #team-fixtures-finished").find(".table-responsive").hide();
                $("#team-fixtures-in-play-error, #team-fixtures-scheduled-error, #team-fixtures-finished-error").html("The fixtures are not available for this team.").show();
            } else {
                $("#team-fixtures-in-play-error, #team-fixtures-scheduled-error, #team-fixtures-finished-error").hide();
                $("#team-fixtures-in-play, #team-fixtures-scheduled, #team-fixtures-finished").find(".table-responsive").fadeIn();
                add_fixtures(team_fixtures, "team");
            }

            // fade in team
            team.fadeIn();
        });
}

// function to get competition fixtures
function get_competition_fixtures(competition_id) {
    // return ajax data
    return $.ajax({ url: "http://api.football-data.org/v1/competitions/" + competition_id + "/fixtures" }).then(function(data) { return data }).catch(function(xhr) { return xhr.status });
}

// function to add competition standings
function add_competition_standings(data) {
    // variable to hold competition standings tbody
    var competition_standings_tbody = $("#competition-standings").find(".card-body").find("tbody");
    // apply logic
    if (data.standing) {
        // empty competition standings tbody
        competition_standings_tbody.empty();
        // for each standing
        $.each(data.standing, function(key, val) {
            // variable to hold function parameters
            var function_parameters = "\"" + get_id(val._links.team.href, 3) + "\"";
            // append content
            competition_standings_tbody.append(
                "<tr>" +
                "<td class='border-info align-middle'>" + val.position + "</td>" +
                "<td class='border-info text-left align-middle'>" +
                "<img class='mr-2' src='" + val.crestURI + "' onerror=\"this.src='http://via.placeholder.com/20x20'\" width='20' />" +
                "<a class='text-info' href='#' onclick='event.preventDefault(); build_team_page(" + function_parameters + ");'>" + val.teamName + "</a>" +
                "</td>" +
                "<td class='border-info align-middle'>" + val.playedGames    + "</td>" +
                "<td class='border-info align-middle'>" + val.wins           + "</td>" +
                "<td class='border-info align-middle'>" + val.draws          + "</td>" +
                "<td class='border-info align-middle'>" + val.losses         + "</td>" +
                "<td class='border-info align-middle'>" + val.goals          + "</td>" +
                "<td class='border-info align-middle'>" + val.goalsAgainst   + "</td>" +
                "<td class='border-info align-middle'>" + val.goalDifference + "</td>" +
                "<td class='border-info align-middle'>" + val.points         + "</td>" +
                "</tr>"
            );
        });
    } else if (data.standings) {
        /*
        competition_standings_tbody.empty();
        $.each(data.standings, function(key, val) {

        });
        */
    }
}

// function to get competition standings
function get_competition_standings(competition_id) {
    // return ajax data
    return $.ajax({ url: "http://api.football-data.org/v1/competitions/" + competition_id + "/leagueTable" }).then(function(data) { return data }).catch(function(xhr) { return xhr.status });
}

// function to add competition teams
function add_competition_teams(data) {
    // variable to hold competition teams card body
    var competition_teams_card_body = $("#competition-teams").find(".card-body");
    // empty competition teams card body
    competition_teams_card_body.empty();
    // for each team
    $.each(data.teams, function(key, val) {
        // variable to hold function parameters
        var function_parameters = "\"" + get_id(val._links.self.href, 3) + "\"";
        // append content
        competition_teams_card_body.append(
            "<a class='btn btn-info bg-transparent text-info mt-0 mr-2 mb-2 ml-0' href='#' onclick='event.preventDefault(); build_team_page(" + function_parameters + ");'>" + val.name + "</a>"
        );
    });
}

// function to get competition teams
function get_competition_teams(competition_id) {
    // return ajax data
    return $.ajax({ url: "http://api.football-data.org/v1/competitions/" + competition_id + "/teams" }).then(function(data) { return data }).catch(function(xhr) { return xhr.status });
}

// function to add competition info
function add_competition_info(data) {
    // variable to hold competition info card body
    var competition_info_card_body = $("#competition-info").find(".card-body");

    // append content
    competition_info_card_body.empty().append(
        "<dl class='row mb-0'>" +
        "<dt class='col-sm-5 col-md-4 col-lg-3 col-xl-2'>League name</dt>"       + "<dd class='col-sm-7 col-md-8 col-lg-9 col-xl-10'>" + data.caption           + "</dd>" +
        "<dt class='col-sm-5 col-md-4 col-lg-3 col-xl-2'>No. of teams</dt>"      + "<dd class='col-sm-7 col-md-8 col-lg-9 col-xl-10'>" + data.numberOfTeams     + "</dd>" +
        "<dt class='col-sm-5 col-md-4 col-lg-3 col-xl-2'>Current match day</dt>" + "<dd class='col-sm-7 col-md-8 col-lg-9 col-xl-10'>" + data.currentMatchday   + "</dd>" +
        "<dt class='col-sm-5 col-md-4 col-lg-3 col-xl-2'>No. of match days</dt>" + "<dd class='col-sm-7 col-md-8 col-lg-9 col-xl-10'>" + data.numberOfMatchdays + "</dd>" +
        "<dt class='col-sm-5 col-md-4 col-lg-3 col-xl-2'>No. of games</dt>"      + "<dd class='col-sm-7 col-md-8 col-lg-9 col-xl-10'>" + data.numberOfGames     + "</dd>" +
        "</dl>"
    );
}

// function to get competition info
function get_competition_info(competition_id) {
    return $.ajax({ url: "http://api.football-data.org/v1/competitions/" + competition_id }).then(function(data) { return data }).catch(function(xhr) { return xhr.status });
}

// function to build competition page
function build_competition_page(competition_id) {

    // fade out competitions
    competitions.fadeOut();
    // fade out team
    team.fadeOut();
    // hide player
    player.hide();

    $.when(
        // get competition info
        get_competition_info(competition_id),
        // get competition teams
        get_competition_teams(competition_id),
        // get competition standings
        get_competition_standings(competition_id),
        // get competition fixtures
        get_competition_fixtures(competition_id)
    ).then(
        function(
            // variable to hold competition info
            competition_info,
            // variable to hold competition teams
            competition_teams,
            // variable to hold competition standings
            competition_standings,
            // variable to hold competition fixtures
            competition_fixtures
        ) {

            // set current competition id
            current_competition_id = competition_id;
            // set current competition name
            current_competition_name = competition_info.caption;

            // set html
            $("#competition-nav").find(".card-header").html(current_competition_name);

            // add competition info
            if ($.inArray(competition_info, [400, 403, 404, 429]) !== -1) {
                $("#competition-info").find(".card-body").html("The information is not available for this competition.");
            } else {
                add_competition_info(competition_info);
            }

            // add competition teams
            if ($.inArray(competition_teams, [400, 403, 404, 429]) !== -1) {
                $("#competition-teams").find(".card-body").html("<div class='text-left'>The teams are not available for this competition.</div>");
            } else {
                add_competition_teams(competition_teams);
            }

            // add competition standings
            if ($.inArray(competition_standings, [400, 403, 404, 429]) !== -1) {
                $("#competition-standings").find(".table-responsive").hide();
                $("#competition-standings-error").html("The standings are not available for this competition.").show();
            } else {
                $("#competition-standings-error").hide();
                $("#competition-standings").find(".table-responsive").fadeIn();
                add_competition_standings(competition_standings);
            }

            // add competition fixtures
            if ($.inArray(competition_fixtures, [400, 403, 404, 429]) !== -1) {
                $("#competition-fixtures-in-play, #competition-fixtures-scheduled, #competition-fixtures-finished").find(".table-responsive").hide();
                $("#competition-fixtures-in-play-error, #competition-fixtures-scheduled-error, #competition-fixtures-finished-error").html("The fixtures are not available for this competition.").show();
            } else {
                $("#competition-fixtures-in-play-error, #competition-fixtures-scheduled-error, #competition-fixtures-finished-error").hide();
                $("#competition-fixtures-in-play, #competition-fixtures-scheduled, #competition-fixtures-finished").find(".table-responsive").fadeIn();
                add_fixtures(competition_fixtures, "competition");
            }

            // fade in competition
            competition.fadeIn();
        });
}

function build_competitions_page() {

    // fade out competition
    competition.fadeOut();
    // hide team
    team.hide();
    // hide player
    player.hide();

    // variable to hold competitions card body
    var competitions_card_body = competitions.find(".card-body");

    // initialize ajax call
    $.ajax({
        // URL to GET data from
        url: "http://api.football-data.org/v1/competitions/"
    }).then(function (data) {
        // empty competitions card body
        competitions_card_body.empty();
        // for each competition
        $.each(data, function(key, val) {
            // variable to hold competition id
            var competition_id = "\"" + get_id(val._links.self.href, 3) + "\"";
            // append content
            competitions_card_body.append(
                "<a href='#' class='btn btn-info bg-transparent text-info m-2' onclick='event.preventDefault(); build_competition_page(" + competition_id + ");'>" +
                val.caption + " <span class='badge badge-info text-dark'>" + val.numberOfTeams + "</span>" +
                "</a>"
            );
        });
        // fade in competitions
        competitions.fadeIn();
    }).catch(function(xhr) {
        // append content
        competitions_card_body.append("<span class='text-info'>" + xhr.responseJSON.error + "</span>");
        // fade in competitions
        competitions.fadeIn();
    });
}

// define on click functions
$("#competition-breadcrumb").find("a").click(function(e) {
    e.preventDefault();
    // build competitions page
    build_competitions_page();
});

$("#team-breadcrumb").find("a").click(function(e) {
    e.preventDefault();
    // build competition page
    build_competition_page(current_competition_id);
});

$("#player-breadcrumb").find("a").click(function(e) {
    e.preventDefault();
    // build team page
    build_team_page(current_team_id);
});

// hide competitions
competitions.hide();
// hide competition
competition.hide();
// hide team
team.hide();
// hide player
player.hide();

// build competitions page
build_competitions_page();

// smooth scroll on anchor click
$('a.page-scroll[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        if (target.length) {
            $('html, body').animate({
                scrollTop: (target.offset().top - 40)
            }, 1000, "easeInOutExpo");
            return false;
        }
    }
});