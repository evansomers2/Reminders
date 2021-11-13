import * as React from 'react';
import { useState, useRef } from 'react';
import { Button, View, Text, ScrollView, TouchableOpacity, TextInput, TouchableHighlight, FlatList } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { abs } from 'react-native-reanimated';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
//https://reactnavigation.org/docs/drawer-based-navigation/
import * as SQLite from 'expo-sqlite';
var testList = ["test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9", "test10", "test11", "test12", "test13", "test14", "test15", "test16", "test17", "test18", "test19", "test20"];

var reminds = [];
var written = false;
const readRemindersFile = async () => {
  let fileUri = FileSystem.documentDirectory + "reminders.txt";

  let text2 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
  return text2;
}

const writeRemindersFile = async (text) => {
  let fileUri = FileSystem.documentDirectory + "reminders.txt";
  await FileSystem.writeAsStringAsync(fileUri, text);
  console.log("Written to file");
  loadList();
}

const loadList = async () => {
  let filetxt = await readRemindersFile();
  let tempReminders = filetxt.split('\n');
  tempReminders.map(rem => {
    console.log(rem);
    if (rem !== "") {
      let linesplit = rem.split(',');
      reminds.push(`${linesplit[0]} - ${linesplit[1]} - ${linesplit[2]}`);
      // if (reminders.indexOf(`${linesplit[0]} - ${linesplit[1]} - ${linesplit[2]}`) == -1) {
      testList.push(`${linesplit[0]} - ${linesplit[1]} - ${linesplit[2]}`);
      //   setReminders(reminders);
      // }

    }
  })
  written = true;

}
loadList();


const HomeScreen = ({ navigation }) => {
  const [state, setState] = useState("");
  if (written) {
    console.log("UPDATE LIST");
    setState("");
    written = false;
  }
  loadList();
  return (
    <View style={{ width: '100%' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={50}
        style={{ width: "90%", maxHeight: 615, marginLeft: 'auto', marginRight: 'auto' }}>
        {testList.map(pok =>
          pok == "" ? null :
            <TouchableOpacity key={`key${pok}`} style={{ borderWidth: 1, borderColor: 'black', height: 80, backgroundColor: 'lightgrey' }} onPress={() => setAmPm(pok)}>
              <Text style={{ textAlign: 'center', color: 'black', fontSize: 30 }} key={Math.random() * 4}>{pok}</Text>
            </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function AddReminder({ navigation }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDetails, setReminderDetails] = useState("");
  const [time, setTime] = useState("");
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [AmPm, setAmPm] = useState("AM");
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  let hours = [" ", 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, ""]
  let tempminutes = Array.from(Array(60).keys());
  let minutes = tempminutes.map(min => min < 10 ? `0${min}` : min);
  minutes.unshift("");
  minutes.push(" ")
  let ampm = ["AM", "PM"]
  const [offsetDirection, setOffsetDirection] = useState(0);
  const [reminders, setReminders] = useState([]);


  const submit = async () => {
    reminders.push({ details: reminderDetails, date: selectedDate, time: `${selectedHour}:${selectedMinute < 10 ? "0" + selectedMinute : selectedMinute}` });
    let text = '';

    reminders.map(reminder => {
      text += reminder.details + ',' + reminder.date + ',' + `${selectedHour}:${selectedMinute < 10 ? "0" + selectedMinute : selectedMinute}` + '\n';
    })
    await writeRemindersFile(text);

    //const db = SQLite.openDatabase("reminders.db");
    //addReminderToDb(db, reminderTitle, reminderDetails, selectedDate, `${selectedHour}:${selectedMinute < 10 ? "0" + selectedMinute : selectedMinute}`);
    written = true;
    navigation.goBack();
  }



  const addReminderToDb = (db, remTitle, remDesc, redDate, remTime) => {
    console.log(remTitle, remDesc, redDate, remTime);
    db.transaction(
      tx => {
        tx.executeSql(
          "create table if not exists reminders (id integer primary key not null, title text, desc text, date:date, time:text);"
        );
        tx.executeSql("insert into reminders (title, desc, date, time) values (?,?,?,?)", [remTitle, remDesc, redDate, remTime]);
        tx.executeSql("select * from reminders", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      this.update
    );
    console.log("DATABASE WRITTEN");
  }

  const handleScrollHour = (event) => {
    let offset = event.nativeEvent.contentOffset.y + 80;
    if (offset === 80) {
      hoursRef.current?.scrollTo({ y: 960, animated: false });
    }
    if (offset == 1120) {
      hoursRef.current?.scrollTo({ y: 80, animated: false, });
    }
    if (offset % 80 === 0) {
      if (offset === 160) {
        setSelectedHour(12);
      }
      else {
        setSelectedHour(event.nativeEvent.contentOffset.y / 80 - 1);
      }
    }
  }

  const handleScrollMinute = (event) => {
    let offset = event.nativeEvent.contentOffset.y + 80;
    if (offset === 80) {
      minutesRef.current?.scrollTo({ y: 4800, animated: false });
    }
    else if (offset === 4960) {
      minutesRef.current?.scrollTo({ y: 80, animated: false, });
    }
    if (offset % 80 === 0) {
      if (offset === 160) {
        setSelectedMinute(0);
      }
      else {
        setSelectedMinute(event.nativeEvent.contentOffset.y / 80 - 1);
      }
    }
  }
  // const handleScrollMinute = (event) => {
  //   let offset = event.nativeEvent.contentOffset.y + 80;
  //   if (offset % 80 === 0) {
  //     setSelectedMinute(event.nativeEvent.contentOffset.y / 80);
  //   }
  // }

  const handleScrollAmPm = (event) => {
    let offset = event.nativeEvent.contentOffset.y;
    if (offset % 50 === 0) {
      if (event.nativeEvent.contentOffset.y === 0) {
        setAmPm("AM");
      }
      if (event.nativeEvent.contentOffset.y === 50) {
        setAmPm("PM");
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ width: '100%' }}>
        <TextInput
          style={{ textAlign: 'center', width: '100%', fontSize: 18, marginTop: 10, marginBottom: 10 }}
          placeholder="Enter Reminder Title"
          onChange={(text) => setReminderTitle(text)} />
        <TextInput
          style={{ textAlign: 'center', width: '100%', fontSize: 18, marginBottom: 10 }}
          placeholder="Enter Reminder Details"
          onChangeText={(text) => setReminderDetails(text)}
        />
        <Text style={{ textAlign: 'center', width: '100%', fontSize: 20, marginBottom: 5 }}>{selectedDate === "" ? "Choose Date" : selectedDate}</Text>
        <Text style={{ textAlign: 'center', width: '100%', fontSize: 20, marginBottom: 5 }}>{`${selectedHour}:${selectedMinute < 10 && selectedMinute !== "" && selectedMinute !== "00" ? 0 : ""}${Math.abs(selectedMinute) < 0 || selectedMinute == 60 ? "00" : Math.abs(selectedMinute)} ${AmPm}`}</Text>
      </View>
      <View style={{}}>
        <Calendar style={{ height: '80%', width: '100%' }}

          // Initially visible month. Default = Date()
          // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
          minDate={'1970-01-01'}
          // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
          maxDate={'2050-05-30'}
          // Handler which gets executed on day press. Default = undefined
          onDayPress={day => {
            setSelectedDate(`${day.year}-${day.month < 10 ? 0 : ''}${day.month}-${day.day}`)
          }}
          // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
          monthFormat={'MMMM'}
          // Handler which gets executed when visible month changes in calendar. Default = undefined
          onMonthChange={month => {
          }}
          // Hide month navigation arrows. Default = false
          hideArrows={false}
          // Do not show days of other months in month page. Default = false
          hideExtraDays={false}
          // If hideArrows=false and hideExtraDays=false do not swich month when tapping on greyed out
          // day from another month that is visible in calendar page. Default = false
          disableMonthChange={false}
          // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
          firstDay={1}

        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            ref={hoursRef}
            onScroll={(event) => handleScrollHour(event)}
            snapToInterval={80}
            snapToAlignment={"center"}
            style={{ flex: 1, width: "33%", maxHeight: 80, position: 'absolute', bottom: 80, left: 30 }}>
            {hours.map(pok =>
              <TouchableOpacity key={`key${pok}`} style={{ borderWidth: 1, borderColor: 'black', height: 80, borderRadius: 50, backgroundColor: 'lightgrey' }} onPress={() => setSelectedHour(pok)}>
                <Text style={{ textAlign: 'center', color: 'black', fontSize: 40, marginTop: 8 }}>{pok}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        <View >
          <ScrollView
            showsVerticalScrollIndicator={false}
            ref={minutesRef}
            onScroll={(event) => handleScrollMinute(event)}
            snapToInterval={80}
            snapToAlignment={"center"}
            style={{ flex: 1, width: "33%", maxHeight: 80, position: 'absolute', bottom: 80, left: 155, borderRadius: 2 }}>
            {minutes.map(pok =>
              <TouchableOpacity key={`key${pok}`} style={{ borderWidth: 1, borderColor: 'black', height: 80, borderRadius: 50, backgroundColor: 'lightgrey' }} onPress={() => setSelectedMinute(pok)}>
                <Text style={{ textAlign: 'center', color: 'black', fontSize: 40, marginTop: 8 }}>{pok}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        <View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={(event) => handleScrollAmPm(event)}
            snapToInterval={50}
            style={{ flex: 1, width: "15%", maxHeight: 50, position: 'absolute', bottom: 95, right: 25, borderRadius: 2 }}>
            {ampm.map(pok =>
              <TouchableOpacity key={`key${pok}`} style={{ borderWidth: 1, borderColor: 'black', height: 50, backgroundColor: 'lightgrey', borderRadius: 50 }} onPress={() => setAmPm(pok)}>
                <Text style={{ textAlign: 'center', color: 'black', fontSize: 30 }}>{pok}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
      <View style={{ position: 'absolute', bottom: 0, width: '50%', left: '25%' }}><Button title="Submit" color='grey' onPress={submit}></Button></View>
    </View >
  );
}

function CalendarScreen({ navigation }) {
  const [count, setCount] = useState(0);
  const [DateInfo, setDateInfo] = useState("");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let marked = {};
  marked["2021-09-21"] = { selected: true, selectedColor: 'red' }
  marked["2021-09-22"] = { selected: true, selectedColor: 'green' }
  marked["2021-09-23"] = { selected: true, selectedColor: 'blue' }
  marked["2021-09-24"] = { selected: true, selectedColor: 'orange' }
  marked["2021-09-25"] = { selected: true, selectedColor: 'pink' }
  marked["2021-09-26"] = { selected: true, selectedColor: 'purple' }
  marked["2021-09-27"] = { selected: true, selectedColor: 'black' }
  marked["2021-09-28"] = { selected: true, selectedColor: 'yellow' }
  let markedDetails = {
    "2021-09-25": { details: "TEST1" },
    "2021-09-26": { details: "TEST2" },
    "2021-09-27": { details: "TEST3" },
    "2021-09-28": { details: "TEST4" },

  }
  return (
    <View style={{ width: '100%' }}>
      <Calendar style={{ height: '80%', width: '100%' }}

        // Initially visible month. Default = Date()
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        minDate={'1970-01-01'}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        maxDate={'2050-05-30'}
        // Handler which gets executed on day press. Default = undefined
        onDayPress={day => {
          console.log(`${day.year}-${day.month < 10 ? 0 : ''}${day.month}-${day.day}`);
          setDateInfo(`${months[day.month - 1]} ${day.day}, ${day.year}\n
          ${markedDetails[`${day.year}-${day.month < 10 ? 0 : ''}${day.month}-${day.day}`].details}`);
        }}
        // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
        monthFormat={'MMMM'}
        // Handler which gets executed when visible month changes in calendar. Default = undefined
        onMonthChange={month => {
        }}
        // Hide month navigation arrows. Default = false
        hideArrows={false}
        // Do not show days of other months in month page. Default = false
        hideExtraDays={false}
        // If hideArrows=false and hideExtraDays=false do not swich month when tapping on greyed out
        // day from another month that is visible in calendar page. Default = false
        disableMonthChange={false}
        // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
        firstDay={1}

        markedDates={marked}

      />
      <View style={{ marginTop: -30, padding: 0 }}>
        <Text style={{ textAlign: 'center', fontSize: 25, margin: 0, padding: 0 }}>{DateInfo}</Text>
      </View>
    </View>

  );
}



const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer style={{ backgroundColor: 'grey' }} s>
      <Drawer.Navigator initialRouteName="Home" >
        <Drawer.Screen name="Reminders" component={HomeScreen} options={{ title: 'Reminders', headerStyle: { backgroundColor: '#878683' } }} />
        <Drawer.Screen name="Add Reminder" component={AddReminder} options={{ title: 'Add a new reminder', headerStyle: { backgroundColor: '#878683' } }} />
        <Drawer.Screen name="Calendar" component={CalendarScreen} options={{ title: 'View your calendar', headerStyle: { backgroundColor: '#878683' } }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
