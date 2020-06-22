import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, TextInput, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions : null,
        scanned : false,
        scannedData : '',
        buttonState : 'normal',
        scannedBookID : '',
        scannedStudentID : '',
        transactionMsg : ''
      }
    }

    getCameraPermissions = async (ID) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: ID,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      this.setState({
        scanned: true,
        scannedData: data,
      });

      if(this.state.buttonState==="bookID") {
        this.setState({
          scannedBookID : data,
          buttonState : 'normal'
        });
      } else if(this.state.buttonState==="studentID") {
        this.setState({
          scannedStudentID : data,
          buttonState : 'normal'
        });
      }
    }

    handleTransaction=async()=>{
      var transactionMsg;
      db.collection("books").doc(this.state.scannedBookID).get()
      .then((doc)=>{
        var book = doc.data();
        if(book.bookAvailability) {
          this.initiateBookIssue();
          transactionMsg = "Book Issued.";
        } else {
          this.initiateBookReturn();
          transactionMsg = "Book returned";
        }
      });
      this.setState({
        transactionMsg : transactionMsg
      });
    }

    initiateBookIssue=async()=>{
      db.collection("transactions").add({
        'studentID' : this.state.scannedStudentID,
        'bookID' : this.state.scannedBookID,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Issue"
      });
      db.collection("books").doc(this.state.scannedBookID).update({
        'bookAvailability' : false
      });
      console.log("working?");
      db.collection("students").doc(this.state.scannedStudentID).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
      });
      console.log("initiated book issue");
      Alert.alert(this.state.transactionMsg);
      this.setState({
        scannedBookID : "",
        scannedStudentID : ""
      });
    }

    initiateBookReturn=async()=>{
      db.collection("transactions").add({
        'studentID' : this.state.scannedStudentID,
        'bookID' : this.state.scannedBookID,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Return"
      });
      db.collection("books").doc(this.state.scannedBookID).update({
        'bookAvailability' : true
      });
      console.log("working?");
      db.collection("students").doc(this.state.scannedStudentID).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
      });
      console.log("initiated book return");
      Alert.alert(this.state.transactionMsg);
      this.setState({
        scannedBookID : "",
        scannedStudentID : ""
      });
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState != "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <View style={styles.container}>
            <View>
              <Image source = {require("../assets/booklogo.jpg")} style ={{width:200, height:200}}/>
              <Text style = {{textAlign:'center', fontSize:30}}>VIRTUAL LIB</Text>
             </View>
            <View style = {styles.inputView}>
              <TextInput style = {styles.inputBox} placeholder = "Book Id" value={this.state.scannedBookID}/>
              <TouchableOpacity style = {styles.scanButton} onPress={()=>{
                this.getCameraPermissions("bookID");
              }}>
                <Text style = {styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <View style = {styles.inputView}>
              <TextInput style = {styles.inputBox} placeholder = "Student Id" value={this.state.scannedStudentID}/>
              <TouchableOpacity style = {styles.scanButton} onPress={()=>{
                this.getCameraPermissions("studentID");
              }}>
                <Text style = {styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={this.handleTransaction}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </View>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      width : 80,
      height : 40,
      borderWidth : 1.5,
      borderLeftWidth : 0
    },
    buttonText:{
      fontSize: 15,
      textAlign : 'center',
      marginTop: 10
    },
    inputBox:{
      width:200,
      height:40,
      borderWidth:1.5,
      borderRightWidth: 0,
      fontSize:20,
      alignItems : 'center'
    },
    inputView : {
      flexDirection : 'row',
      margin : 20
    },
    submitButton : {
      width : 100,
      height : 50,
      backgroundColor : '#6ba09d'
    },
    submitButtonText : {
      padding : 10,
      textAlign : 'center',
      fontSize : 20,
      fontWeight : 'bold',
      color : '#ffffff'
    }
  });