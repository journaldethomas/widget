let widget = await createWidget();
if (!config.runsInWidget) {
    await widget.presentSmall();
}

Script.setWidget(widget);
Script.complete();

async function createWidget(items) {

    /* Get data from API */
    const tempImg = await getImage('temperature.png');
    const humidImg = await getImage('humidity.png');
    const logoImg = await getImage('hass-favicon.png');

    let req = new Request("https://homeassistant.votre_nom_de_domaine/api/states")
    req.headers = { "Authorization": "Bearer token_dehome_assistant", "content-type": "application/json" }
    let json = await req.loadJSON();

    /* Parse data received from API */
    let data = {outdoor: {}, salon: {}, parents: {}, maxence: {}, chloe: {}}

    data.outdoor = addData(json, data.outdoor, ['sensor.netatmo_maison_piece_de_vie_jardin_temperature', 'sensor.netatmo_maison_piece_de_vie_jardin_humidity']);
    data.salon = addData(json, data.salon, ['sensor.netatmo_maison_piece_de_vie_temperature', 'sensor.netatmo_maison_piece_de_vie_humidity']);
    data.parents = addData(json, data.parents, ['sensor.netatmo_maison_piece_de_vie_chambre_parentale_temperature', 'sensor.netatmo_maison_piece_de_vie_chambre_parentale_humidity']);
    data.maxence = addData(json, data.maxence, ['sensor.temp_humidite_07_chambre_maxence_temperature', 'sensor.temp_humidite_07_chambre_maxence_humidity']);
    data.chloe = addData(json, data.chloe, ['sensor.temp_humidite_11_chambre_chloe_temperature', 'sensor.temp_humidite_11_chambre_chloe_humidity']);

    /* Create the widget */
    const widget = new ListWidget();
    widget.backgroundColor = new Color("#03a9f4", 1.0);

    /* Design the widget header */
    let headerStack = widget.addStack();
    const logoStack = headerStack.addStack();
    headerStack.addSpacer(2);
    const titleStack = headerStack.addStack();
    headerStack.addSpacer(7);
    const tempImageStack = headerStack.addStack();
    headerStack.addSpacer(14);
    const humidImageStack = headerStack.addStack();

    /* Add a logo icon */
    logoStack.backgroundColor = new Color("#03a9f4", 1.0)
    logoStack.cornerRadius = 1
    const wimgLogo = logoStack.addImage(logoImg)
    wimgLogo.imageSize = new Size(20, 20)
    wimgLogo.rightAlignImage()

    /* Add the name of this Home Assistant */
    const titleLabel = titleStack.addText("HA74");
    titleStack.setPadding(2, 0, 0, 0);
    titleLabel.font = Font.heavyMonospacedSystemFont(12);
    titleLabel.textColor = Color.black();

    /* Add a temperature icon */
    tempImageStack.backgroundColor = new Color("#03a9f4", 1.0)
    tempImageStack.cornerRadius = 1
    const wimgTemp = tempImageStack.addImage(tempImg)
    wimgTemp.imageSize = new Size(20, 20)
    wimgTemp.rightAlignImage()

    /* Add a humid icon */
    humidImageStack.backgroundColor = new Color("#03a9f4", 1.0)
    humidImageStack.cornerRadius = 1
    const wimgHumid = humidImageStack.addImage(humidImg)
    wimgHumid.imageSize = new Size(20, 20)
    wimgHumid.rightAlignImage()

    widget.addSpacer(5)

    /* Add the sensor entries */
    const bodyStack = widget.addStack();

    /* First, the label column */
    const labelStack = bodyStack.addStack();
    labelStack.setPadding(0, 0, 0, 0);
    labelStack.borderWidth = 0;
    labelStack.layoutVertically();

    addLabel(labelStack, "    Jardin :")
    addLabel(labelStack, "    Maison :")
    addLabel(labelStack, "    Parents :")
    addLabel(labelStack, "    Chloé :")
    addLabel(labelStack, "    Maxence :")

    /* Second, the temperature column */
    const tempStack = bodyStack.addStack();
    tempStack.setPadding(0, 3, 0, 0);
    tempStack.borderWidth = 0;
    tempStack.layoutVertically();

    addTemp(tempStack, data.outdoor)
    addTemp(tempStack, data.salon)
    addTemp(tempStack, data.parents)
    addTemp(tempStack, data.chloe)
    addTemp(tempStack, data.maxence)

    /* Third, the humidity column */
    const humidStack = bodyStack.addStack();
    humidStack.setPadding(0, 5, 0, 0);
    humidStack.borderWidth = 0;
    humidStack.layoutVertically();

    addHumid(humidStack, data.outdoor)
    addHumid(humidStack, data.salon)
    addHumid(humidStack, data.parents)
    addHumid(humidStack, data.chloe)
    addHumid(humidStack, data.maxence)

    /* Done: Widget is now ready to be displayed */
    return widget;
}

/* Adds the entries to the label column */
async function addLabel(labelStack, label) {
    const mytext = labelStack.addText(label);
    mytext.font = Font.semiboldSystemFont(10);
    mytext.textColor = Color.black();
}

/* Adds the entries to the temperature column */
async function addTemp(tempStack, data) {
    const mytext = tempStack.addText(data.temp + "°C");
    mytext.font = Font.heavyMonospacedSystemFont(10);
    mytext.textColor = Color.white();
}

/* Adds the entries to the humidity column */
async function addHumid(humidStack, data) {
    const mytext = humidStack.addText("(" + data.humid + "%)");
    mytext.font = Font.mediumMonospacedSystemFont(10);
    mytext.textColor = Color.white();
    mytext.textOpacity = 0.8;
}

/*
The following function is "borrowed" from:
https://gist.github.com/marco79cgn/23ce08fd8711ee893a3be12d4543f2d2
Retrieves the image from the local file store or downloads it once
*/
async function getImage(image) {
    let fm = FileManager.local()
    let dir = fm.documentsDirectory()
    let path = fm.joinPath(dir, image)
    if (fm.fileExists(path)) {
        return fm.readImage(path)
    } else {
        // download once
        let imageUrl
        switch (image) {
            case 'temperature.png':
                imageUrl = "https://journaldethomas.com/scriptable/temperature.png"
                break
            case 'humidity.png':
                imageUrl = "https://journaldethomas.com/scriptable/humidity.jpeg"
                break
            case 'hass-favicon.png':
                imageUrl = "https://journaldethomas.com/scriptable/favicon.png"
                break
            default:
                console.log(`Sorry, couldn't find ${image}.`);
        }
        let iconImage = await loadImage(imageUrl)
        fm.writeImage(path, iconImage)
        return iconImage
    }
}

/*
The following function is "borrowed" from:
https://gist.github.com/marco79cgn/23ce08fd8711ee893a3be12d4543f2d2
Downloads an image from a given URL
*/
async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}

/* Searches for the respective sensor values ('state') in the API response of Home Assistant */
function addData(json, room, sensors) {
    room.temp = "N/A";
    room.humid = "N/A";
    var i;
    for (i = 0; i < json.length; i++) {
        if (json[i]['entity_id'] == sensors[0]) {
            room.temp = Math.round(json[i]['state']);
        }
        if (json[i]['entity_id'] == sensors[1]) {
            room.humid = Math.round(json[i]['state']);
        }
    }
    return room;
}
