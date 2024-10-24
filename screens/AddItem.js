import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Form from '../Components/Form'
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddItem = () => {

    const navigation = useNavigation();
    const navigateHome = () => {
        navigation.navigate('Home')
    }
    
  return (
    <SafeAreaView style={styles.container}>
        <View>
            <TouchableOpacity onPress={navigateHome} style={styles.button}><Text style={styles.buttonText}>Back</Text></TouchableOpacity>

        </View>
        <View style={styles.formContainer}>
            <Form/>
        </View>
    </SafeAreaView>
  )
}

export default AddItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10
    },
    buttonText: {
        textAlign: 'center',
        padding: 10,
        color: 'white'
      },
    button: {
        borderRadius: 10,
        backgroundColor: 'black', 
        width: 60,
    },
})