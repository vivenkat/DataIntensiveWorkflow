if (Meteor.isClient) {
    var curSelect = 'custom';

    Template.query.events({
        'input': function() {
            var curText = $('#str-input').val();
            $('#cypher-text').val(cypherString(curSelect, curText));
        },

        'change select': function() {
            curSelect = $('#query-select').val();
            $('#str-input').val('');
            switch (curSelect) {
                case 'custom':
                    $('#str-input').attr('placeholder', 'Chyper query');
                    break;
                case 'movie-person':
                    $('#str-input').attr('placeholder', 'Movie title (The Matrix, Cloud Atlas)');
                    break;
                case 'person-movie':
                    $('#str-input').attr('placeholder', 'Person name (Keanu Reeves, Kevin Bacon)');
                    break;
                case 'person-person':
                    $('#str-input').attr('placeholder', 'Person name (Keanu Reeves, Kevin Bacon)');
                    break;
            }
        },

        'click button': function() {
            Meteor.call('querydb', $('#cypher-text').val(), function(error, result){
                console.log(JSON.stringify(result));

                var nodeSet = [];
                var edgeSet = [];
                var foundNodes = {};
                var foundEdges = {};

                for (var element of result) {
                    for (var relation of element['relationships']) {
                        if (relation['id'] in foundEdges) {
                            continue;
                        } else {
                            foundEdges[relation['id']] = true;
                            var nextRel = {};

                            nextRel['color'] = 'gray';
                            nextRel['from'] = relation['startNode'];
                            nextRel['to'] = relation['endNode'];
                            edgeSet.push(nextRel);
                        }
                    }
                    for (var node of element['nodes']) {
                        if (node['id'] in foundNodes) {
                            continue;
                        } else {
                            var nextNode = {};
                            if (node['labels'][0] == 'Movie') {
                                nextNode['color'] = '#bae1ff';
                                nextNode['label'] = node['properties']['title'];
                            } else if (node['labels'][0] == 'Person') {
                                nextNode['color'] = '#ffdfba';
                                nextNode['label'] = node['properties']['name'];
                            }

                            foundNodes[node['id']] = true;
                            nextNode['id'] = node['id'];
                            nodeSet.push(nextNode);
                        }
                    }
                }

                var container = $('#mynetwork').get()[0];
                var data = {
                    nodes: nodeSet,
                    edges: edgeSet
                };
                var options = {
                    nodes: {
                        shape: 'dot',
                        size: 15
                    },
                    physics: {
                        barnesHut: {
                            centralGravity: 0.2
                        }
                    }
                };
                var network = new vis.Network(container, data, options);

            });
        }
    });

    Accounts.ui.config({
        passwordSignupFields: 'USERNAME_ONLY'
    });

    Meteor.startup(function() {
        landingGraph();
    });
}

if (Meteor.isServer) {
    var db;

    db = new Neo4jDB('http://localhost:7474', {
        username: 'neo4j',
        password: 'password'
    });

    Meteor.methods({
        'querydb': function(cypher) {
            var res = db.graph(cypher).fetch();
            return res;
        }
    });
}

function cypherString(type, input) {
    switch(type) {
        case 'movie-person':
            return 'MATCH (people:Person)-[relatedTo]-(:Movie {title: "' + input + '"}) RETURN people.name, Type(relatedTo), relatedTo';
        case 'person-person':
            return 'MATCH (people2:Person)-[relatedTo2]-(movie:Movie)-[relatedTo]-(:Person {name: "' + input + '"}) RETURN movie.title, Type(relatedTo), relatedTo, relatedTo2, people2';
        case 'person-movie':
            return 'MATCH (movie:Movie)-[relatedTo]-(:Person {name: "' + input + '"}) RETURN movie.title, Type(relatedTo), relatedTo';
        case 'custom':
            return input;
    }
}

function landingGraph() {
    var nodes = new vis.DataSet([
        {id: 1, label: 'Node 1'},
        {id: 2, label: 'Node 2'},
        {id: 3, label: 'Node 3'},
        {id: 4, label: 'Node 4'},
        {id: 5, label: 'Node 5'},
        {id: 6, label: 'Node 6'}
    ]);

    // create an array with edges
    var edges = new vis.DataSet([
        {from: 1, to: 3, arrows:'to'},
        {from: 1, to: 2, arrows:'to'},
        {from: 2, to: 4, arrows:'to'},
        {from: 2, to: 5, arrows:'to'}
    ]);

    // create a network
    var container = $('#mynetwork').get()[0];
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        nodes: {
            shape: 'dot',
            size: 15
        },
        physics: {
            barnesHut: {
                centralGravity: 0.2
            }
        }
    };
    var network = new vis.Network(container, data, options);
}