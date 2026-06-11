//imports
import inquirer from "inquirer";
import { v4 as uuidv4 } from "uuid";
import fsp from "fs/promises";
import fs, { read, readdir } from "fs";
import exit from "process";
import { stringify } from "querystring";

// Function to check if the databse file exists, if not it creates one
function checkDB(){
    if (!fs.existsSync("db.json")){
        console.log("Databse doesnt exist...");
        fs.writeFileSync("db.json", JSON.stringify([]));
        console.log("Created a new database file");
    }
    return true;
}
   //function to read the json file and return the data within it
async function readDB(){
    if (checkDB()){
        try{
            const data = await fsp.readFile("db.json", "utf-8");
            return JSON.parse(data);
        } catch(error) {
            console.error("Error retrieving the data", error);
            return [];
        }
    } return [];
    
}

//function to save the data back to the json file
async function saveDB(info){
    try{
        await fsp.writeFile("db.json", JSON.stringify(info, null, 2));
    } catch(error){
        console.error("error saving to database", error);
    }

}

//function to add a user to the databse
async function addUser(){
    try{
        const reply = await inquirer.prompt([
            {
                type: "input",
                name: "name",
                message: "Enter the name?"
            },
            {
                type: "input",
                name: "username",
                message: "Enter the username?"
            },
            {
                type: "input",
                name: "password",
                message: "Enter the password"
            },
            {
                type: "input",
                name: "phoneNumber",
                message: "Enter the phone number"
            },
            
        ]
        );
        const info = await readDB();

        const data = {
            id: uuidv4(),
            name: reply.name,
            username: reply.username,
            password: reply.password,
            phoneNumber: reply.phoneNumber,
        };

        info.push(data);
        
        await saveDB(info);
        console.log('user added successfully');

    } catch(error){
        console.error("Error adding user", error);
    }
}


//function to update a user's information
async function updateUser(){
    try{

        const info = await readDB();

        if (info.length==0){
            console.log("Database is empty");
            return;
        }

        const userid = await inquirer.prompt([
            {
                type: "input",
                name: "id",
                message: "Enter user id"
            }
        ]);

        const current = info.find(element => element.id == userid.id);
        if (!current){
            console.log("user not found");
            return;
        }
        
        await updateUserDetails(current, info);

            
        


    } catch(error){
    console.error("Somehting went wrong", error);
    }

}

//helper function to update user's information
async function updateUserDetails(current, info){
    try{
        const update = await inquirer.prompt([
            {
                type: "input",
                default: current.name,
                name: "name",
                message: "Enter the name?"
            },
            {
                type: "input",
                default: current.username,
                name: "username",
                message: "Enter the username?"
            },
            {
                type: "input",
                default: current.password,
                name: "password",
                message: "Enter the password"
            },
            {
                type: "input",
                default: current.phoneNumber,
                name: "phoneNumber",
                message: "Enter the phone number"
            },
            
        ]
        );

        current.name = update.name;
        current.username = update.username;
        current.password = update.password;
        current.phoneNumber = update.phoneNumber;

        await saveDB(info);
        console.log("User updated!");

        

    } catch(error){
        console.error("Error updating user", error);
    }
}

//function to delete a user form the database
async function deleteUser(){
    try{

        const info = await readDB();

        if (info.length==0){
            console.log("Database is empty");
            return;
        }

        const userid = await inquirer.prompt([
            {
                type: "input",
                name: "id",
                message: "Enter user id"
            }
        ]);

        let remainingData=[];
        info.forEach(element => { if(element.id != userid.id){
            remainingData.push(element);    
        }    
        });
        if (info.length == remainingData.length){
            console.log("User not found");
            return;
        }

        
        await saveDB(remainingData);
        console.log("User Deleted")

    } catch(error){
    console.error("Somehting went wrong", error);
    }

}


// cli loop
async function cliMenu(){
    let choice;
    do {

        console.log("--------------- Users Databse Menu ---------------");
        console.log("** Select one of the options or enter 0 to exit **");
        console.log("--------------------------------------------------");
        console.log("1. Create new user");
        console.log("2. Retrieve users data");
        console.log("3. Update an existing user");
        console.log("4. Delete an existing user");

    const input = await inquirer.prompt([
        {
            type: "input",
            name: "number",
            message: "Enter choice:"
        }
    ]
    );
    choice = parseInt(input.number);

    switch (choice){
        case 1: 
            console.log("Creating a new user...");
            await addUser();
            break;
        case 2: 
            console.log("Retrieving users...");
            const users = await readDB();
            console.table(users);
            break;
        case 3:
            console.log("Updating existing user...");
            await updateUser();
            break;
        case 4:
            console.log("Deleting user...");
            await deleteUser();
            break;
        case 0:
            console.log("Exiting Menu, Thank you!.");
            break;
        default:
            console.log("Invalid option, please choose a number 0-4");
    }


    } while(choice != 0);
    process.exit(0);
}

//calling the main function
cliMenu();