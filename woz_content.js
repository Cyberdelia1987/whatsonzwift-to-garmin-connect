class WorkoutsFetcher {
    getWorkouts(ftp) {
        let workoutsList = [];
        let workouts = document.getElementsByClassName('workout');
        for (let workout of workouts) {
            let workoutSteps = [];
            let breadcrumbs = workout.getElementsByClassName('breadcrumbs')[0];
            var workoutName = '';
            let buttons = breadcrumbs.getElementsByClassName('button');
            for (let button of buttons) {
                workoutName += button.textContent.trim() + ' - ';
            }
            workoutName = workoutName.replace(/\s-\s$/, '') + ': '+breadcrumbs.getElementsByTagName('h4')[0].textContent.trim();
    
            let workoutList = workout.getElementsByClassName('workoutlist')[0];
            let steps = workoutList.getElementsByClassName('textbar');
            for (let s in steps) {
                let text = steps[s].textContent;
                if (typeof text == 'undefined') {
                    continue;
                }
    
                workoutSteps = workoutSteps.concat(this.parseTextIntoSteps(text, ftp));  
            }

            workoutsList.push({
                name: workoutName,
                description: workout.getElementsByClassName('workoutdescription')[0].childNodes[2].textContent,
                ftp: ftp,
                steps: workoutSteps,
            });
        }
    
        return workoutsList
    }

    parseTextIntoSteps(text, ftp) {    
        if (typeof text == 'undefined') {
            return [];
        }
    
        let tests = [
            /(?<min>[0-9]+min\s)?(?<sec>[0-9]+sec\s)?free ride/g,
            /(?<min>[0-9]+min\s)?(?<sec>[0-9]+sec\s)?from (?<from>[0-9]+) to (?<to>[0-9]+[W%])/g,
            /(?<repeats>[0-9]+x\s)?(?<min>[0-9]+min\s)?(?<sec>[0-9]+sec\s)?@\s(?<rpm>[0-9]+rpm,\s)?(?<value>[0-9]+[W%])/g
        ];
    
        let steps = [];
    
        for (let testType in tests) {
            let regex = tests[testType];
            let match = regex.exec(text);
            if (!match) {
                continue;
            }
    
            let intervalData = this.getIntervalDataFromMatch(match, ftp, testType);
    
            if (testType == 0) { // Freeride
                steps.push({
                    type: "freeride",
                    duration: intervalData.duration,
                    from: 0,
                    to: 0,
                    rpm: null
                });
            } else if (testType == 1) { // Ramp up/down
                let segments = intervalData.duration / (intervalData.duration <= 180 ? 30 : 60);
                if (segments < 3) {
                    segments = 1;
                }
    
                if (segments > 6) {
                    segments = 6;
                }
    
                let segmentDuration = intervalData.duration / segments;
                let segmentDelta = (intervalData.to - intervalData.from) / segments;
                for (let j = 0; j < segments; j++) {
                    let from = Math.round(intervalData.from + j * segmentDelta - intervalData.window),
                    to = Math.round(intervalData.from + j*segmentDelta + intervalData.window);
                    steps.push({
                        type: from < to ? "warmup" : "cooldown",
                        duration: segmentDuration,
                        from: from,
                        to: to,
                        rpm: null,
                    });
                }
            } else if (match.groups.repeats) {
                let underMatch = tests[2].exec(text);
                let underInterval = this.getIntervalDataFromMatch(underMatch, ftp, testType);
                for (let r = 0; r < parseInt(match.groups.repeats); r++) {
                    steps.push({
                        type: "interval",
                        duration: intervalData.duration,
                        from: intervalData.from,
                        to: intervalData.to,
                        rpm: intervalData.rpm,
                    });
                    steps.push({
                        type: "interval",
                        duration: underInterval.duration,
                        from: underInterval.from,
                        to: underInterval.to,
                        rpm: underInterval.rpm
                    });
                }
            } else {
                steps.push({
                    type: "interval",
                    duration: intervalData.duration,
                    from: intervalData.from,
                    to: intervalData.to,
                    rpm: match.groups.rpm,
                });
            }
        }
    
        return steps;
    }

    getIntervalDataFromMatch(match, ftp, testType) {
        let duration = parseInt(match.groups.min ? match.groups.min.replace('min ', '') : 0) * 60 + parseInt(match.groups.sec ? match.groups.sec.replace('sec ', '') : 0);
        let isPercent = match.groups.to ? match.groups.to.indexOf('%') >= 0 : (match.groups.value ? match.groups.value.indexOf('%') >= 0 : false);
        let window = isPercent ? Math.round(ftp * 3 / 100) : 5;
    
        if (testType == 2) {
            let value = parseInt(match.groups.value);
            var from = value - window;
            var to = value + window;
        } else {
            from = parseInt(match.groups.from);
            to = parseInt(match.groups.to);
        }
        
        if (isPercent) {
            from = Math.round(ftp * from / 100);
            to = Math.round(ftp * to / 100);
        }
    
        return {
            duration: duration,
            from: from,
            to: to,
            rpm: match.groups.rpm ? match.groups.rpm.replace(/,\s$/, '') : null,
            window: window,
        };
    }
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'report_back') {
        wf = new WorkoutsFetcher()
        sendResponse(wf.getWorkouts(msg.ftp), msg.ftp);
    }
});