// Ecout de l'évènement
document.addEventListener('deviceready', onDeviceReady, false);
// Définition des paramètres
var serviceUuid = "19B10002-E8F2-537E-4F6C-D104768A1214";
var characteristicUuid = "5364e780-99b4-45f7-8711-785bba88465d";
var characteristicUuidbat ="2A19";
var bleDevices = [];

var deviceId;
// Creation du graphe
const ctx = document.getElementById('mygraph');
// Definition des paramètres du graphe
myChart= new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['temps'],
      datasets: [{
        label: 'Pressure',
        data: [],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          min: 80000
        },
       
      }
    }
  });
//Déclaration de la variable startimeData
var startimeData = 0;
//Cette fonction est appelée lorsque le dispositif est prêt
function onDeviceReady() {
    console.log('Device is ready');
    // Ajout d'un écouteur d'événement sur le changement de la sélection du canal
    document.getElementById('channel').addEventListener('change', function(){
        // Réinitialiser les données et de rechercher de nouveaux dispositifs
        reinitialiserDonnees();
        scanForDevices()});
    document.getElementById('connectButton').addEventListener('click',function(){
        var channel =document.getElementById('channel').value;
        if (channel==2){
            connectToDeviceother(deviceId)} // Gestion de le connexion avec un autre dispositif
        else{
            connectToDevice(deviceId) // Connexion à un dispositif par défaut
        }});
    document.getElementById('deconnectButton').addEventListener('click',function(){
        deconnected(deviceId); //Gestion de la déconnexion d'un dispositif
    }) ;
    // Ajout d'un écouteur d'événement sur le clic pour afficher les données
    document.getElementById('donnees').addEventListener('click',function() {
         // Afficher les données du dispositif et la batterie, et de démarrer le chronomètre
        afficherdonnee(deviceId);
        afficherbattery();
        startimeData = performance.now();
    });
   
// Fonction pour scanner les dispositifs
function scanForDevices() {
    var channelSelect = document.getElementById('channel');
    var selectedChannel = channelSelect.value;

    console.log('Scanning for BLE devices...');
    bleDevices = [];
    var style=document.getElementById('Scan');

    ble.scan([], 5, function(device) {
        onDeviceDiscovered(device);
        console.log('Found device: ', device);
        //Affectation de chaque élément du channel à un scan prédéfini
        // Pour le tétine me
        if (selectedChannel === '0' && device.name === "me") {
            ble.stopScan();
            deviceId=device.id;
            console.log(deviceId);
            style.style.display='none';
        // Pour le tétine tz
        } else if (selectedChannel === '1' && device.name === "te") {
            ble.stopScan();
            deviceId=device.id;
            style.style.display='none';
        // Pour le choix "autes"
        } else if (selectedChannel === '2') {
            
            style.style.display='block';
            scanotherDevices();

            
        }
    }, onError);
}
// Fonction pour lancer un scan à la recherche de dispositifs Bluetooth Low Energy (BLE)
function scanotherDevices() {
    console.log('Scanning for BLE devices...');
    ble.scan([], 5, onDeviceDiscoveredother, onError);
}
// Fonction de callback appelée lorsqu'un dispositif est découvert par la fonction scan précédente
function onDeviceDiscovered(device) {
    console.log('Found device: ' + JSON.stringify(device));
    bleDevices.push(device);
    
}
// Fonction similaire à onDeviceDiscovered mais utilisée spécifiquement avec scanotherDevices
function onDeviceDiscoveredother(device) {
    console.log('Found device: ' + JSON.stringify(device));
    bleDevices.push(device);
    updateDeviceSelect();
}
// Mettre à jour l'élément de sélection HTML avec les dispositifs BLE découverts
function updateDeviceSelect() {
    var deviceSelect = document.getElementById('deviceSelect');
    deviceSelect.innerHTML = '<option value="">Select a Device</option>';
    bleDevices.forEach(function(device) {
        var option = document.createElement('option');
        option.value = device.id;
        option.textContent = device.name + ' (' + device.id + ')';
        deviceSelect.appendChild(option);
    });
}
// Fonction pour se connecter à un autre dispositif BLE sélectionné 
function connectToDeviceother() {
        // Accès à l'élément de sélection par son identifiant et récupération de l'identifiant du dispositif sélectionné
    var deviceSelect = document.getElementById('deviceSelect');
    var selectedDeviceId = deviceSelect.value;
        // Stockage de l'identifiant du dispositif sélectionné pour un usage ultérieur
    deviceId=deviceSelect.value;
        // Affichage de l'identifiant du dispositif sélectionné dans la console
    console.log('Selected device ID: ' + selectedDeviceId);

    // Vérification si un dispositif a été sélectionné
    if (selectedDeviceId) {
        // Mesure du temps de connexion
        var startConnect = performance.now();
        // Tentative de connexion au dispositif sélectionné
        ble.connect(selectedDeviceId, function(peripheral) {
            // En cas de succès, affichage des informations du périphérique connecté et du temps de connexion
            console.log('Connected to device: ' + JSON.stringify(peripheral));
            var endConnect = performance.now();
            var connectTiming = endConnect - startConnect;
            // Mise à jour de l'interface utilisateur pour afficher le temps de connexion
            document.getElementById('connectionTime').textContent = "Temps de connexion : " + Math.round(connectTiming) + " ms";
            // Mise à jour de l'interface utilisateur pour indiquer que la connexion est établie
            document.getElementById('connectionStatus').textContent = 'Connected';
        }, function(error) {
            // En cas d'échec, affichage de l'erreur et mise à jour de l'interface utilisateur
            console.error('Error connecting to device: ' + JSON.stringify(error));
            document.getElementById('connectionStatus').textContent = 'Error connecting: ' + error.message;
        });
    } else {
        console.error('No device selected');
    }
}
// Fonction pour se connecter à un dispositif BLE prédéfini par son identifiant
// Memes fonctions que la fonction précédente
function connectToDevice(deviceId) {
    document.getElementById('connectionStatus').textContent = 'Connection status: Connecting';
    console.log('Attempting to connect to device ID: ' + deviceId);
    var startConnect = performance.now();
    ble.connect(deviceId, function(peripheral) {
        console.log('Connected to device: ' + JSON.stringify(peripheral));
        var endConnect = performance.now();
        var connectTiming = endConnect - startConnect;
        document.getElementById('connectionTime').textContent = "Temps de connexion : " + Math.round(connectTiming) + " ms";
        document.getElementById('connectionStatus').textContent = 'Connection status: Connected';
    }, function(error) {
        console.error('Error connecting to device: ' + JSON.stringify(error));
        document.getElementById('connectionStatus').textContent = 'Error connecting: ' + error.message;
    });
}

// Fonction de gestion des erreurs
function onError(error) {
    console.error('Error: ' + error);
    alert('Error: ' + error);
}

// Fonction pour déconnecter un dispositif BLE
function deconnected(deviceId) {
    console.log("disconnecting");
    ble.disconnect(deviceId, function() {
        console.log("Device disconnected successfully");
        document.getElementById('connectionStatus').textContent = 'Connection status: deconnected';
    }, function(error) {
        console.error("Failed to disconnect device", error);
    });
}

// Tableau global pour stocker les dernières données reçues
var dernièresDonnées = [];
function afficherbattery(){
    ble.read(deviceId, serviceUuid, characteristicUuidbat, function(data){
        var dataArray = new Uint8Array(data);
        var batteryLevel = dataArray[0]; 
        document.getElementById('battery').textContent = "Niveau de batterie : "+batteryLevel + "%";
    }, function(error) {
        console.error('Error reading battery characteristic:', error);
        document.getElementById('battery').textContent = "Erreur de lecture";
    });
}
//Fonction pour affciher les données
function afficherdonnee(deviceId) {
    console.log(deviceId);
    if (deviceId) {
        console.log('Attempting to read from device ID: ' + deviceId);
        ble.read(deviceId, serviceUuid, characteristicUuid, function(data) {
            var floatData = new Float32Array(data);
            console.log('Read float data: ', floatData[0],);
            var nomdevice = document.getElementById('channel').value;
            if(nomdevice==0){
                nomdevice='Me';
            }
            if(nomdevice==1){
                nomdevice='Te';
            }
            
            // Ajoute la nouvelle donnée à la fin du tableau
            dernièresDonnées.push({
                nom: nomdevice,
                heure: new Date().toLocaleTimeString(), // Exemple: "12:34:56"
                pression: floatData[0]
                });
            var endtimeData = performance.now();
            var timingData = endtimeData - startimeData;
            document.getElementById('acquisitionTime').textContent="Temps d'acquisition de la donnée : " + Math.round(timingData) + " ms";
            // Ajoute la donnée reçue au tableau des dernières données
            if (dernièresDonnées.length >= 10) {
                // Retire l'élément le plus ancien si le tableau a déjà 10 éléments
                dernièresDonnées.shift();
            }
            // Mise à jour de l'affichage des données
            var dataDisplayElement = document.getElementById('dataDisplay');
            if (dataDisplayElement) {
                dataDisplayElement.textContent = "Dernière donnée enregistrée : " + floatData[0].toString()+" Pa"; // Affiche la dernière donnée reçue
            }

            // Optionnel : Mise à jour d'un élément d'interface utilisateur pour afficher toutes les dernières données
            // Par exemple, mise à jour d'un élément 'tableurDisplay' pour montrer toutes les valeurs dans dernièresDonnées
            var tableurDisplayElement = document.getElementById('tableurDisplay');
            if (tableurDisplayElement) {
                // Commence par le code HTML pour l'en-tête du tableau
                var htmlTableau = '<table><thead><tr><th>Tétine</th><th>Heure</th><th>Pression en Pa</th></tr></thead><tbody>';
            
                // Ajoute une ligne dans le tableau pour chaque objet dans dernièresDonnées
                dernièresDonnées.forEach(function(donnee) {
                    htmlTableau += `<tr><td>${donnee.nom}</td><td>${donnee.heure}</td><td>${donnee.pression}</td></tr>`;
                });
            
                // Ferme le tbody et le tableau
                htmlTableau += '</tbody></table>';
            
                // Met à jour le contenu de tableurDisplayElement avec le tableau HTML généré
                tableurDisplayElement.innerHTML = htmlTableau;
            }
            // Appeler la fonction pour ajouter les nouvelles données au graphique
            addData(dernièresDonnées[dernièresDonnées.length - 1].heure, dernièresDonnées[dernièresDonnées.length - 1].pression);
        }, onError);
    } else {
        console.error('No device selected');
    }
}}

function addData(time, pressure) {
    // Ajouter le temps et la pression aux tableaux de données
    myChart.data.labels.push(time);
    myChart.data.datasets[0].data.push(pressure);

    // Mettre à jour le graphique
    myChart.update();
}
function reinitialiserDonnees() {
    // Vide le tableau des dernières données
    dernièresDonnées = [];

    // Met à jour l'affichage pour montrer que le tableau est vide
    var dataDisplayElement = document.getElementById('dataDisplay');
    if (dataDisplayElement) {
        dataDisplayElement.textContent = "Dernière donnée enregistrée : Aucune donnée"; // Message indiquant qu'il n'y a plus de données
    }

    // Met à jour le tableau HTML pour retirer toutes les lignes de données
    var tableurDisplayElement = document.getElementById('tableurDisplay');
    if (tableurDisplayElement) {
        var htmlTableau = '<table><thead><tr><th>Tétine</th><th>Heure</th><th>Pression en Pa</th></tr></thead><tbody>';
        // Puisqu'il n'y a plus de données, on ne rajoute pas de lignes dans le tbody
        htmlTableau += '</tbody></table>';
        tableurDisplayElement.innerHTML = htmlTableau;
    }
}