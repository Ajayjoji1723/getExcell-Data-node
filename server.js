const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const port = process.env.PORT || 3001;
const cors = require('cors');
const stripe = require('stripe')('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');
const bodyParser = require("body-parser")

const dbPath = path.join(__dirname,'usersData.db');

const app = express()
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

let db = null;

const initializeDBAndServer =async()=>{
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(port,()=>console.log(`Server running at ${port}`))
    }catch(e){
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
}

initializeDBAndServer();

const convertDBObjectToResponseObject = dbObject=>{
    return{
        id:dbObject.id,
        name:dbObject.name,
        gender:dbObject.gender,
        age:dbObject.age,
        mobileNum:dbObject.mobile_num,
        emailId:dbObject.email_id,
        keySkills:dbObject.key_skills,
        highestQualification:dbObject.highest_qualification,
        addressProof:dbObject.addres_proof,
        experienceLetter:dbObject.experience_letter,
        presentLocation:dbObject.present_location,
        languages:dbObject.languages,
        expectedCtc:dbObject.expected_ctc,
        enterpreneurType:dbObject.enterpreneur_type,
        dob:dbObject.date_of_birth,
        pincode:dbObject.pincode
    }
}

app.get("/", async(req,res)=>{
    const allUsersQuery = `SELECT * FROM usersdata`
    const allUsers = await db.all(allUsersQuery)
    res.json(allUsers.map((user)=>
    convertDBObjectToResponseObject(user)))
})


//write data to db
app.post('/post/', async(req,res,err)=>{
    try{
        const {name,gender,age,mobileNum,emailId,keySkills,highestQualification,addressProof,expLetter,presesntLocation,languages,expectedCtc,enterprenuerType,dob,pincode} = req.body;
        const now = new Date(dob).toISOString().slice(0,10)
        console.log(now)
        const addUserQuery = `INSERT INTO usersdata(name,gender,age,mobile_num,email_id,key_skills,highest_qualification,addres_proof,experience_letter,present_location,languages,	expected_ctc,enterpreneur_type,date_of_birth,pincode)
        VALUES(
            '${name}',
            '${gender}',
             ${age},
             ${mobileNum},
            '${emailId}',
            '${keySkills}',
            '${highestQualification}',
            '${addressProof}',
            '${expLetter}',
            '${presesntLocation}',
           '${languages}',
            '${expectedCtc}',
            '${enterprenuerType}',
            '${now}',
            ${pincode}
            
        )`
        await db.run(addUserQuery)
        res.status(200)
        res.json({msg:'User details added successfully'})
    }catch(err){
        console.log(`error: ${err.message}`)
        res.json({message:err.message})
    }
})

app.post('/pay', async (req, res) => {
    try {
      const amount = req.body.amount;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'inr',
        payment_method_types: ['card'],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
        amount: amount
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: err.message
      });
    }
  });



app.put("/update/:id/", async(req,res)=>{
    const {id} = req.params;   
    const {keySkills} = req.body;
    const updateQuery = `UPDATE usersdata SET key_skills = '${keySkills}' WHERE id = ${id}`
    await db.run(updateQuery)
    res.json({msg:'data updated'})
})
 

module.exports =app; 