const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const port = process.env.PORT || 3001;
const cors = require('cors');

const dbPath = path.join(__dirname,'usersData.db');

const app = express()
app.use(cors({origin: true}))
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

app.put("/update/:id/", async(req,res)=>{
    const {id} = req.params;   
    const {dob} = req.body;
    const now = new Date(dob).toISOString().slice(0,10)
    console.log(now)
    const updateQuery = `UPDATE usersdata SET date_of_birth = '${now}' WHERE id = ${id}`
    await db.run(updateQuery)
    res.json({msg:'dob updated'})
})
 

module.exports =app; 