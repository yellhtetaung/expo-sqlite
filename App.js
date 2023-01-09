import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  StatusBar,
} from "react-native";
import * as SQLite from "expo-sqlite";

export default function App() {
  const db = SQLite.openDatabase("sqlite");

  const [isLoading, setIsLoading] = useState(true);
  const [names, setNames] = useState([]);
  const [currentName, setCurrentName] = useState(undefined);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)`
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM names`,
        null,
        (txObj, resultSet) => setNames(resultSet.rows._array),
        (txObj, error) => console.log(error)
      );
    });

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ fontSize: 20 }}>Loading....</Text>
      </View>
    );
  }

  const addName = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO names (name) values (?)`,
        [currentName],
        (txObj, resultSet) => {
          let existingNames = [...names];
          existingNames.push({ id: resultSet.insertId, name: currentName });
          setNames(existingNames);
          setCurrentName(undefined);
        },
        (txObj, error) => console.log(error)
      );
    });
  };

  const showNames = () => {
    return names.map((name, index) => {
      return (
        <View style={styles.row} key={index}>
          <Text>{name.name}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="orange" />
      <TextInput
        value={currentName}
        onChangeText={setCurrentName}
        placeholder="Enter Category"
        style={{ marginHorizontal: 8, marginVertical: 10 }}
      />
      <Button title="Submit" onPress={addName} />
      {showNames()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
});
