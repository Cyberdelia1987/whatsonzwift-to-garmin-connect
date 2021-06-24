var GarminConnectBridge = {
    sportTypeTemplate: {
        sportTypeId: 2,
        sportTypeKey: "cycling",
        displayOrder: 2,
    },

    workoutTemplate: {
        workoutId: null,
        ownerId: null,
        workoutName: null,
        workoutNameI18nKey: null,
        description: null,
        descriptionI18nKey: null,
        updatedDate: null,
        createdDate: null,
        sportType: null,
        subSportType: null,
        trainingPlanId: null,
        author: {
            userProfilePk: null,
            displayName: null,
            fullName: null,
            profileImgNameLarge: null,
            profileImgNameMedium: null,
            profileImgNameSmall: null,
            userPro: false,
            vivokidUser: false,
        },
        shared: false,
        sharedWithUsers: null,
        estimatedDurationInSecs: 0,
        estimatedDistanceInMeters: null,
        workoutSegments: [],
        atpPlanId: null,
        consumer: null,
        consumerImageURL: null,
        consumerName: null,
        consumerWebsiteURL: null,
        locale: null,
        poolLength: null,
        poolLengthUnit: null,
        uploadTimestamp: null,
        workoutProvider: null,
        workoutSourceId: null,
    },

    segmentTemplate: {
        segmentOrder: null,
        sportType: null,
        workoutSteps: [],
    },

    stepTypes: {
        warmup: {
            stepTypeId: 1,
            stepTypeKey: "warmup",
        },
        cooldown: {
            stepTypeId: 2,
            stepTypeKey: "cooldown",
        },
        interval: {
            stepTypeId: 3,
            stepTypeKey: "interval",
        },
        recovery: {
            stepTypeId: 4,
            stepTypeKey: "recovery",
        },
        repeat: {
            stepTypeId: 6,
            stepTypeKey: "repeat",
        },
    },
    

    stepTemplate: {
        stepId: null,
        childStepId: null,
        description: null,
        type: null,
        stepOrder: null,
        endCondition: {},
        endConditionCompare: null,
        endConditionValue: null,
        preferredEndConditionUnit: null,
        stepType: {},
        targetType: {
            workoutTargetTypeId: 2,
            workoutTargetTypeKey: 'power.zone'
        },
        targetValueOne: null,
        targetValueTwo: null,
        zoneNumber: null,
    },

    CreatePayloadFromWOZData: function(workout) {
        let gcWorkout = this.clone(this.workoutTemplate);
        gcWorkout.workoutName = workout.name;
        gcWorkout.description = workout.description;
        gcWorkout.sportType = this.clone(this.sportTypeTemplate);

        let gcSteps = [],
            stepOrder = 0,
            estimatedDuration = 0;

        for (let step of workout.steps) {
            estimatedDuration += step.duration;
            stepOrder++;

            let gcStep = this.clone(this.stepTemplate);
            gcStep.type = "ExecutableStepDTO";
            gcStep.endCondition = {conditionTypeId: 2, conditionTypeKey: "time"};
            gcStep.endConditionValue = step.duration;
            gcStep.stepOrder = stepOrder;

            switch (step.type) {
                case "warmup": 
                    gcStep.stepType = this.stepTypes.warmup;
                    break;
                case "cooldown":
                    gcStep.stepType = this.stepTypes.cooldown;
                    break;
                case "freeride":
                    gcStep.stepType = this.stepTypes.interval;
                    break;
                case "interval":
                    if ((step.from + step.to) / 2 < workout.ftp*.65) {
                        gcStep.stepType = this.stepTypes.recovery;
                    } else {
                        gcStep.stepType = this.stepTypes.interval;
                    }
                    break;
            }

            gcStep.targetValueOne = step.from;
            gcStep.targetValueTwo = step.to;
            if (step.rpm) {
                gcStep.description = step.rpm + ' RPM';
            }

            gcSteps.push(gcStep)
        }

        let gcWorkoutSegment = this.clone(this.segmentTemplate);
        gcWorkoutSegment.workoutSteps = gcSteps;
        gcWorkoutSegment.segmentOrder = 1;
        gcWorkoutSegment.sportType = this.clone(this.sportTypeTemplate);
        gcWorkout.workoutSegments = [gcWorkoutSegment];
        gcWorkout.estimatedDurationInSecs = estimatedDuration;
        gcWorkout.createdDate = (new Date()).toJSON();
        gcWorkout.updatedDate = gcWorkout.createdDate;

        return gcWorkout;
    },

    clone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}