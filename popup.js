let setFtpButton = document.getElementById("set_ftp");
let ftpField = document.getElementById("ftp_field");
let log = document.getElementById("log");
let gcTab = null;

chrome.storage.sync.get("ftp", ({ ftp }) => {
    ftpField.value = ftp;
});

setFtpButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    let val = ftpField.value;
    chrome.storage.sync.set({ 'ftp': val });
    return false;
});

chrome.tabs.query({}, tabs => {
    let wozRegex = /^https:\/\/whatsonzwift\.com/,
        gcRegex = /^https:\/\/connect\.garmin\.com/,
        wozTab = null;

    for (tab of tabs) {
        let url = tab.url;
        if (wozRegex.test(url)) {
            wozTab = tab
        }

        if (gcRegex.test(url)) {
            gcTab = tab
        }
    }

    if (wozTab) {
        chrome.storage.sync.get("ftp", ({ ftp }) => {
            chrome.tabs.sendMessage(wozTab.id, {text: 'report_back', ftp: ftp}, renderWorkouts) 
        }); 
    }
});

function renderWorkouts(data) {
    let workoutsContainer = document.getElementById('workouts');
    const zones = [
        {from: 0, to: 60, color: '#7f7f7f'},
        {from: 60, to: 75,color: '#338cff'},
        {from: 75, to: 90, color: '#59bf59'},
        {from: 90, to: 105, color: '#ffcc3f'},
        {from: 105, to: 120, color:'#ff6639'},
        {from: 120, to: Number.MAX_VALUE, color: '#ff330c'},
    ];
    for (workout of data) {
        let container = document.createElement('div');
        container.className = 'workout-container';
        let name = document.createElement('h4');
        name.innerText = workout.name;
        container.append(name);
        let totalDuration = 0;
        for (let step of workout.steps) {
            totalDuration += step.duration;
        }

        let plot = document.createElement('div');
        plot.className = 'workout-plot';
        for (let step of workout.steps) {
            let bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = (step.duration / totalDuration) * 100 + '%';
            let ftpPercentage = (step.from + step.to) / 2 / workout.ftp * 100; 
            bar.style.paddingBottom = ftpPercentage / 12 +'%';
            for (zone of zones) {
                if (ftpPercentage >= zone.from && ftpPercentage < zone.to) {
                    bar.style.backgroundColor = zone.color;
                }
            }
            
            plot.append(bar);
        }

        gcWorkout = GarminConnectBridge.CreatePayloadFromWOZData(workout);
        container.dataset.gcWorkout = JSON.stringify(gcWorkout);

        let content = document.createElement('div'),
            icon = document.createElement('i');

        content.className = 'content';
        content.append(plot);

        if (gcTab) {
            let button = document.createElement('button');
            icon.className = 'bi bi-cloud-arrow-up';
            button.append(icon);
            content.append(button);
            button.addEventListener('click', function() {
                let payload = this.closest('.workout-container').dataset.gcWorkout;
                chrome.tabs.sendMessage(
                    gcTab.id, 
                    {text: 'report_back', payload: JSON.parse(payload)},
                    function(xhr) {
                        xhr.onreadystatechange = function(){
                            if (xhr.readyState == XMLHttpRequest.DONE) {
                                if (xhrResponse.status == 200) {
                                    alert('Workout successfully created');
                                } else {
                                    alert('There were some errors creating workout. Take a look in console.')
                                    console.log(xhrResponse.responseText);
                                }
                            }
                        }
                    }
                )
            });
        }
        
        container.append(content);
        workoutsContainer.append(container);
    }
}