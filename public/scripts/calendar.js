
// gather dates
const months = [{month:'January',days:31},{month:'February',days:28},{month:'March',days:31},{month:'April',days:30},{month:'May',days:31},{month:'June',days:30},{month:'July',days:31},{month:'August',days:31},{month:'September',days:30},{month:'October',days:31},{month:'November',days:30},{month:'December',days:31}]
const date = new Date()
const month = date.getMonth()
const day = date.getDate()
const currentYear = date.getFullYear()

var nextMonthStart
const monthStart = new Date(`${currentYear}`,`${month}`,1)
if(month < 11){
    nextMonthStart = new Date(`${currentYear}`,`${month + 1}`,1)
}
else{
    // Need to adjust nextMonthStart to account for year changes
    nextMonthStart = new Date()
}
// the weekday the month starts on: Sunday 0 - Saturday 6
const weekDay = monthStart.getDay()
// the weekday the next month starts on
const endWeekDay = nextMonthStart.getDay()

const totalDays = months[month].days
const currentMonth = months[month].month

const calendarHeader = document.querySelector('.calendar-header')
const calendar = document.getElementById('calendar-body')
const numbers = [0,1,2,3,4,5,6,7,8,9]

// list of goal dates and attached goals
const goalList = []
const goalObject = {}
// dates that were already appended into goalList
const usedDates = []

// the day goal modal
const dayGoalModal = document.getElementById('goal-modal')
const closeDayGoalModal = document.getElementById('close-goal-modal').addEventListener('click', () => { hideModal(dayGoalModal) ; clearGoalModal() })
const goalModalHeader = document.getElementById('goal-modal-header')
const goalModalData = document.getElementById('goal-modal-data')
const goalModalIncomplete = document.getElementById('goal-modal-incomplete')
const goalModalComplete = document.getElementById('goal-modal-complete')

// filters created goals to find matches for current month 
const addedGoals = document.querySelectorAll('.goal-dates')
const completeGoalDates = document.querySelectorAll('.complete-goal-dates')
const goalElements = document.querySelectorAll('.goal-element')
const completeGoalElements = document.querySelectorAll('.complete-goal-element')
addedGoals.forEach(goal => {
    if(goal.textContent[1] == month + 1){
        // gathers goal dates
        let newDate = ''
        for(let i = 3; i < 5; i++){
            newDate += goal.textContent[i]}
        // check that newDate hasn't already been used
        if(usedDates.includes(newDate)){
            return;
        }
        // cycle through the goal elements and grab the goals that match the goal date
        let matchedGoals = []
        for(let i = 0; i < goalElements.length; i++){
            let firstIndex = goalElements[i].textContent.indexOf('|')
            let secondIndex = goalElements[i].textContent.indexOf('|',(firstIndex + 1))
            let dateText = goalElements[i].textContent.slice(secondIndex+1).trim()
            dateText = dateText.slice(3,5)
            if(dateText == newDate){
                // get goal text here
                let goalText = goalElements[i].textContent.slice((firstIndex+1),secondIndex).trim()
                matchedGoals.push(goalText)
            }
        }
        // cleans extra 0's on single digit dates
        if(newDate[0] == '0'){
            newDate = newDate.slice(1)
        }
        // create my new object
        let newObj = { [newDate] : matchedGoals }
        goalList.push(newObj)
        usedDates.push(newDate)
        goalObject[newDate] = matchedGoals
    }
})

// gather completed goal dates
const usedCompleteDates = []
completeGoalDates.forEach(date => {
    // checks for current month
    if(date.textContent[0] == '0' && date.textContent[1] == month + 1){
        date = date.textContent.toString()
        let newDate = date.slice(3,5)
        usedCompleteDates.push(newDate)
    }
})

const dayKeys = Object.keys(goalObject)
// create blank divs to align weekdays
if(weekDay > 0){
    // empty days at the beginning of the month
    for(let empty = 0; empty < weekDay; empty++){
        const emptyDay = document.createElement('div')
        emptyDay.classList.add('empty-day')
        calendar.appendChild(emptyDay)
    }
}

// create calendar dates
calendarHeader.textContent = currentMonth
for(let i = 1; i < (totalDays + 1); i++){

    const newDay = document.createElement('div')
    newDay.classList.add('cal-day')
    const dayNumber = document.createElement('div')
    dayNumber.textContent = i
    newDay.appendChild(dayNumber)
    // check for days containing goals, append them
    if(dayKeys.includes(`${i}`)){
        // console.log(goalObject[i][(goalObject[i].length - 1)])
        // creates divs for each individual goal per day and adds all to day div
        if(goalObject[i].length > 1){
            const goalsDiv = document.createElement('div')
            goalsDiv.classList.add('goal-div')
            goalsDiv.textContent = `(${goalObject[i].length} Goals)`
            newDay.appendChild(goalsDiv)
        }
        else{
            for(let goalIndex = 0; goalIndex < goalObject[i].length; goalIndex++){
                // create a div to hold goal contents
                const goalsDiv = document.createElement('div')
                goalsDiv.classList.add('goal-div')
                goalsDiv.textContent = goalObject[i][goalIndex]
                newDay.appendChild(goalsDiv)
            }
        }
        
    }//else{ console.log(`DayKeys did not Include ${i}`)}

    // check completed goals for matches with the current date 
    if(usedCompleteDates.includes(`${i}`)){
        const instances = countInstances(usedCompleteDates,i)
        const completeGoalCount = document.createElement('div')
        completeGoalCount.textContent = `(${instances} Completed)`
        newDay.appendChild(completeGoalCount)
    }

    newDay.addEventListener('click',() => { displayModalGoals(i) ; showModal(dayGoalModal) })
    calendar.appendChild(newDay)
}

// empty days at the end of the month
if(endWeekDay > 0){
    for(let empty = 0; empty < endWeekDay + 1; empty++){
        const emptyDay = document.createElement('div')
        emptyDay.classList.add('empty-day')
        calendar.appendChild(emptyDay)
    }
}
// enablers
var gcEnabled = false
var gvEnabled = false
var guEnabled = false
var grEnabled = false

// managers
const goalCreate = document.getElementById('goal-create')
const goalView  = document.getElementById('goal-view')
const goalUpdate = document.getElementById('goal-update')
const goalRemove = document.getElementById('goal-remove')

// buttons
const createGoalBtn = document.getElementById('createGoal-btn').addEventListener('click', () => { toggleGoalCreate() })
const viewGoalBtn = document.getElementById('viewGoal-btn').addEventListener('click', () => { toggleGoalView() })
const updateGoalBtn = document.getElementById('updateGoal-btn').addEventListener('click', () => { toggleGoalUpdate() })
const removeGoalBtn = document.getElementById('removeGoal-btn').addEventListener('click', () => { toggleGoalRemove() })

// Does not currently work - status does not get updated
function updateModal(modal,status_){
    console.log(status_)
    if(status_ == true){
        status_ = false
        modal.classList.add('hidden')
    }else{
        status_ = true
        modal.classList.remove('hidden')
        console.log(status_)
    }
}

function showModal(modal){
    modal.classList.remove('hidden')
}
function hideModal(modal){
    modal.classList.add('hidden')
}
function displayModalGoals(day){
    goalModalHeader.textContent = `${currentMonth} ${day}`

    // incomplete goals
    day = day.toString()
    let modalGoals = []
    for(let i = 0; i < goalElements.length; i++){
        let firstIndex = goalElements[i].textContent.indexOf('|')
        let secondIndex = goalElements[i].textContent.indexOf('|',(firstIndex + 1))
        let dateText = goalElements[i].textContent.slice(secondIndex+1).trim()
        if(day.length === 1){
            // match single digit dates
            if(dateText[4] == day && dateText[3] == '0'){
                let goalText = goalElements[i].textContent.slice(firstIndex + 1,secondIndex).trim()
                modalGoals.push(goalText)
            }
        }
        else{
            // match double digit dates
            if(dateText.slice(3,5) == day){
                let goalText = goalElements[i].textContent.slice(firstIndex + 1,secondIndex).trim()
                modalGoals.push(goalText)
            }
        }
    }
    modalGoals.forEach( goal => {
        const modalGoalDiv = document.createElement('li')
        modalGoalDiv.textContent = goal
        modalGoalDiv.classList.add('temporary-goal-div')
        goalModalIncomplete.appendChild(modalGoalDiv)
    })
    
    // complete goals
    modalGoals = []
    for(let i = 0; i < completeGoalElements.length; i++){
        let firstIndex = completeGoalElements[i].textContent.indexOf('|')
        let secondIndex = completeGoalElements[i].textContent.indexOf('|',(firstIndex + 1))
        let dateText = completeGoalElements[i].textContent.slice(secondIndex+1).trim()
        if(day.length === 1){
            // match single digit dates
            if(dateText[4] == day && dateText[3] == '0'){
                let goalText = completeGoalElements[i].textContent.slice(firstIndex + 1,secondIndex).trim()
                modalGoals.push(goalText)
            }
        }
        else{
            // match double digit dates
            if(dateText.slice(3,5) == day){
                let goalText = completeGoalElements[i].textContent.slice(firstIndex + 1,secondIndex).trim()
                modalGoals.push(goalText)
            }
        }
    }
    modalGoals.forEach( goal => {
        const modalGoalDiv = document.createElement('li')
        modalGoalDiv.textContent = goal
        modalGoalDiv.classList.add('temporary-goal-div')
        goalModalComplete.appendChild(modalGoalDiv)
    })
}

function clearGoalModal(){
    const removableDivs = document.querySelectorAll('.temporary-goal-div')
    removableDivs.forEach( div => {
        div.remove()
    })
}
function toggleGoalCreate(){
    if(gcEnabled){
        gcEnabled = false
        goalCreate.classList.add('hidden')
    }
    else{
        gcEnabled = true
        goalCreate.classList.remove('hidden')

        guEnabled = false
        grEnabled = false
        goalUpdate.classList.add('hidden')
        goalRemove.classList.add('hidden')
    }
}
function toggleGoalView(){
    if(gvEnabled){
        gvEnabled = false
        goalView.classList.add('hidden')
    }
    else{
        gvEnabled = true
        goalView.classList.remove('hidden')
    }
}
function toggleGoalUpdate(){
    if(guEnabled){
        guEnabled = false
        goalUpdate.classList.add('hidden')
    }
    else{
        guEnabled = true
        goalUpdate.classList.remove('hidden')

        gcEnabled = false
        grEnabled = false
        goalCreate.classList.add('hidden')
        goalRemove.classList.add('hidden')
    }
}
function toggleGoalRemove(){
    if(grEnabled){
        grEnabled = false
        goalRemove.classList.add('hidden')
    }
    else{
        grEnabled = true
        goalRemove.classList.remove('hidden')

        gcEnabled = false
        guEnabled = false
        goalCreate.classList.add('hidden')
        goalUpdate.classList.add('hidden')
    }
}
function countInstances(list,instance){
    let count = 0
    for(let i = 0; i < list.length; i++){
        if(list[i] == instance){
            count += 1
        }
    }
    return count
}

/*
    Checklist:
        - create order options for goal list
        - alignment for days in calendar body
        - general styling
*/