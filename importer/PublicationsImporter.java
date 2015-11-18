package io.bekti;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.Arrays;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.core.MediaType;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import org.json.simple.JSONObject;

public class Main {

    private static final String SERVER_ROOT_URI = "http://10.0.19.207:7474/db/data/";

    private static URI createNode(String entity) {
        final String nodeEntryPointUri = SERVER_ROOT_URI + "node";

        WebResource resource = Client.create()
                .resource(nodeEntryPointUri);

        ClientResponse response = resource.accept(MediaType.APPLICATION_JSON)
                .type(MediaType.APPLICATION_JSON)
                .entity(entity)
                .post(ClientResponse.class);

        final URI location = response.getLocation();
        System.out.println(String.format(
                "POST to [%s], status code [%d], location header [%s]",
                nodeEntryPointUri, response.getStatus(), location.toString()));
        response.close();

        return location;
    }

    public static void main(final String[] args) throws Exception {
        File inputFile = new File("/Users/sbekti/Downloads/publications.txt");
        File outputFile = new File("/Users/sbekti/Downloads/publications.csv");

        int counter = 0;

        try (BufferedReader br = new BufferedReader(new FileReader(inputFile))) {
            String line;
            ArrayList<String> authors = new ArrayList<>();
            // ArrayList<Integer> referenceIds = new ArrayList<>();

            FileWriter writer = new FileWriter(outputFile);

            //writer.append("\"id\"|\"title\"|\"author\"|\"coauthors\"|\"year\"|\"conference\"\n");

            Map<String, String> map = new HashMap<>();

            while ((line = br.readLine()) != null) {
                if (line.endsWith(" ")) continue;

                if (line.startsWith("#*")) {
                    String title = line.substring(2).replaceAll("\"", "");
                    map.put("title", title);
                } else if (line.startsWith("#@")) {
                    String authorsString = line.substring(2).replaceAll("\"", "");
                    authors = new ArrayList<>(Arrays.asList(authorsString.split(",")));
                    //map.put("authors", authorsString);
                } else if (line.startsWith("#t")) {
                    String year = line.substring(2);
                    map.put("year", year);
                } else if (line.startsWith("#c")) {
                    String conference = line.substring(2).replaceAll("\"", "");
                    map.put("conference", conference);
                } else if (line.startsWith("#index")) {
                    String id = line.substring(6);
                    map.put("id", id);
                } else if (line.startsWith("#%")) {
                    // referenceIds.add(Integer.parseInt(line.substring(2)));
                } else {
                    writer.append("\"");
                    writer.append(map.get("id"));
                    writer.append("\"");
                    writer.append("|");
                    writer.append("\"");
                    writer.append(map.get("title"));
                    writer.append("\"");
                    writer.append("|");
                    writer.append("\"");

                    if (authors.size() == 0) {
                        writer.append("\"");
                        writer.append("|");
                        writer.append("\"");
                        writer.append("");
                    } else {
                        writer.append(authors.get(0));
                        writer.append("\"");
                        writer.append("|");
                        writer.append("\"");
                        authors.remove(0);
                        writer.append(String.join(",", authors));
                    }

                    writer.append("\"");
                    writer.append("|");
                    writer.append("\"");
                    writer.append(map.get("year"));
                    writer.append("\"");
                    writer.append("|");
                    writer.append("\"");
                    writer.append(map.get("conference"));
                    writer.append("\"");
                    writer.append("\n");

                    authors = new ArrayList<>();

                    ++counter;

                    if (counter % 100 == 0) {
                        System.out.println(counter);
                    }
                }
            }

            writer.close();
        }

        System.out.println(counter);

        //CREATE INDEX ON :Publication(id) USING PERIODIC COMMIT LOAD CSV WITH HEADERS FROM "file:/home/sbekti/Desktop/publications.csv" AS row FIELDTERMINATOR "|" CREATE (:Publication {publicationId: toInt(row.id), title: row.title, authors: row.authors, year: toInt(row.year), conference: row.conference});

        // USING PERIODIC COMMIT LOAD CSV FROM "file:/home/sbekti/Desktop/segmentaa" AS line FIELDTERMINATOR "|" CREATE (:Publication { publicationId: toInt(line[0]), title: line[1], authors: line[2], year: toInt(line[3]), conference: line[4]});
    }

}

