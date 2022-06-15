const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const config = require('./db/config')
const connection = mysql.createConnection(config)

/* 
    Features:
        - notecards
        - quiz app
        - calendar 
        - schdule manager
        - database integration ( users, user customization, scoring )
*/
var completeGoals
var incompleteGoals

const app = express()

// configuration
app.set('view engine','html')
app.set('views','./public/views')
app.engine('.html',require('ejs').renderFile)

// middleware/routing
app.use(bodyParser.urlencoded({ extended:true }))
app.use('/',express.static('public'))

app.get('/flashcards', (req,res) => {
    res.render('flashcards')
})

app.get('/calendar', (req,res) => {
    let sql = `select * from goals where status=?`
    connection.query(sql,'complete', (err,results,fields) => {
        if(err){
            return console.error(`Error: ${err.message}`)
        }
        completeGoals = results
    })
    connection.query(sql,'incomplete', (err,results,fields) => {
        if(err){
            return console.error(`Error: ${err.message}`)
        }
        incompleteGoals = results
        res.render('calendar',{ comGoals: completeGoals, incomGoals: incompleteGoals })
    })
})
app.post('/calendar', (req,res) => {
    const formId = req.body.id
    var sql
    var values
    var id
    switch(formId){
        case 'create':
            const completionDate = req.body.completionDate
            const hyphenIndex = completionDate.indexOf('-')
            const yearSlice = completionDate.slice(0,hyphenIndex)
            const dateSlice = completionDate.slice((hyphenIndex + 1))
            const updatedCompletionDate = dateSlice.concat('-',yearSlice)
            const goal = req.body.goalEntry
            sql = `insert into goals(goal,end_date,status) values(?,?,?)`
            values = [goal,updatedCompletionDate,'incomplete']
            connection.query(sql,values,(err,results,fields) => {
                if(err){
                    return console.error(`Error: ${err.message}`)
                }
                console.log('Goal Created')
            })
            res.redirect('/calendar')
            break
        case 'delete':
            id = req.body.goalId
            sql = `delete from goals where goal_id=?`
            connection.query(sql,id,(err,results,fields) => {
                if(err){
                    return console.error(`Error: ${err.message}`)
                }
                console.log('Goal Removed')
            })
            res.redirect('/calendar')
            break
        case 'update':
            id = req.body.goalId
            sql = `update goals set status=? where goal_id=?`
            values = ['complete',id]
            connection.query(sql,values, (err,results,fields) => {
                if(err){
                    return console.error(`Error: ${err.message}`)
                }
                console.log('Goal Status Set to Complete')
            })
            res.redirect('/calendar')

    }
})

app.get('/quiz', (req,res) => {
    res.render('quiz')
})



app.listen(3000, () => { console.log('Server Online at Port 3000') })