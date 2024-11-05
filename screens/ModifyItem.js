import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { removeItem, selectItems, updateItem } from '../Redux/itemReducer';
import nfcManager, { NfcTech } from 'react-native-nfc-manager';

const ModifyItem = ({route}) => {

    const {item} = route.params;
    const [customChange, setCustomChange] = useState(0);
    const [container, setContainer] = useState(item.container);
    const [style, setStyle] = useState(item.style);
    const [notes, setNotes] = useState(item.notes);
    const [modalVisible, setModalVisible] = useState(false);

    const data = useSelector(selectItems)

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const goToHomeScreen = () => {
        navigation.navigate('Home')
    }

    const toggleModal = () => {
        setModalVisible(!modalVisible)
    }

    function addDays(date, days) {
        const result = new Date(date)
        result.setDate(result.getDate() + Number(days));
        return result;
    }

    const handleUpdate = (item, days) => {
        console.log(container)
        console.log(style)
        const updatedItem = {
            ...item,
            expirationDate: addDays(item.expirationDate, days),
            container: container,
            style: style,
            notes: notes
        }
        dispatch(updateItem(updatedItem))
        navigation.goBack()
    }

    const handleContainerChange = (item, cont, sty) => {
        console.log(cont)
        console.log(sty)
        const updatedItem = {
            ...item,
            container: cont,
            style: sty
        }
        dispatch(updateItem(updatedItem))
    }

    const getBackgroundStyle = (twoDigitString) => {
        const number = parseInt(twoDigitString, 10); 
      
        const styles = {
          1: { backgroundColor: '#d64646'},
          2: { backgroundColor: '#2a7ca8' },
          3: { backgroundColor: '#2aa84f' },
          4: { backgroundColor: 'yellow' },
          5: { backgroundColor: 'purple' },
          6: { backgroundColor: 'orange' },
          7: { backgroundColor: 'pink' },
          8: { backgroundColor: 'brown' },
          9: { backgroundColor: 'grey' },
          10: { backgroundColor: 'cyan' },
        };
      
        return styles[number] || { backgroundColor: 'white' };
      };
    function handleEdit(cont){
        setContainer(cont)
    }

    const handleContainer = (cont, sty) => {
        const unique = !data.some(item => item.container === cont)
        if(unique === true) {
            handleContainerChange(item, cont, sty)
        }
        else{
            clearContainer();
            toggleModal();
            return
        }
      }
    
    function clearContainer() {
        setContainer('00000000')
        setStyle({ backgroundColor: 'white' })
        return
    }

    async function readNdef() {
        try {
          await nfcManager.requestTechnology(NfcTech.Ndef);
          const tag = await nfcManager.getTag();
          console.log('tag found')
          setStyle(getBackgroundStyle(String.fromCharCode(...(tag.ndefMessage[0].payload.slice(3))).substring(0,2)))
          const cont = String.fromCharCode(...(tag.ndefMessage[0].payload.slice(5)))
          const sty = getBackgroundStyle(String.fromCharCode(...(tag.ndefMessage[0].payload.slice(3))).substring(0,2))
          handleContainer(cont, sty)
        }
        catch(ex) {
          console.warn('oops!', ex)
        } finally {
          console.log(container)
          nfcManager.cancelTechnologyRequest();
        }
    }
    const handleDelete = (item) => {
        const id = item.id
        dispatch(removeItem(id))
        goToHomeScreen();
    }
    function formatDate(item) {
        const date = new Date(item.expirationDate)
        let month = '' + (date.getMonth() + 1)
        let day = '' + date.getDate()
        let year = '' + date.getFullYear()

        if(month.length < 2){
            month = '0' + month
        }
        if(day.length < 2){
            day = '0' + day
        }
        return [month, day, year].join('/')
    }
  return (
    <View style={[styles.container]}>
    <SafeAreaView style={[styles.contentContainer]}>
        <View>
            <TouchableOpacity onPress={goToHomeScreen} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
            <Text style={styles.largeText}>{item.name}</Text>
            <Text>expires on: {formatDate(item)}</Text>
        </View>
        <View style={styles.edit}>
            <View style={styles.sectionView}>
                <Text>Edit Expiration</Text>
                <View style={styles.editOptions}>
                  <View>
                    <View style={styles.addRemove}>
                        <TouchableOpacity style={styles.subtractButton} onPress={() => handleUpdate(item, -7)}><Text>-7</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.addButton} onPress={() => handleUpdate(item, 7)}><Text>+7</Text></TouchableOpacity>
                    </View>
                    <View style={styles.addRemove}>
                        <TouchableOpacity style={styles.subtractButton} onPress={() => handleUpdate(item, -1)}><Text>-1</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.addButton} onPress={() => handleUpdate(item, 1)}><Text>+1</Text></TouchableOpacity>
                    </View>
                  </View>
                  <View>
                    <TextInput
                        style={styles.inputCustom}
                        placeholder="add(+), subtract(-)"
                        placeholderTextColor="darkgrey"
                        value={customChange}
                        onChangeText={setCustomChange}
                    />
                    <TouchableOpacity style={[styles.button, {backgroundColor: 'black'}]} onPress={() => handleUpdate(item, customChange)}>
                        <Text style={styles.buttonText}>Save Custom</Text>
                    </TouchableOpacity>
                  </View>
                </View>
            </View>

            <TextInput
                  style={styles.input}
                  placeholder={item.notes}
                  placeholderTextColor="darkgrey"
                  value={notes}
                  onChangeText={setNotes}
                />
            <View style={styles.addRemove}>
                <TouchableOpacity style={styles.editButton} onPress={readNdef}>
                    <Text style={styles.buttonText}> Edit Container</Text>
                </TouchableOpacity>
                <View style={[styles.colorShow, style]}/>
            </View>
        </View>
        <View>

        </View>
        <Modal
          animationType='fade'
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>This container is already in use. Please use a different container.</Text>
                <TouchableOpacity onPress={() => toggleModal()} style={styles.closeButton}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
    <TouchableOpacity style={styles.removeButton} onPress={() => handleDelete(item)}><Text>Remove Item</Text></TouchableOpacity>
    </View>
  )
}

export default ModifyItem

const styles = StyleSheet.create({
    sectionView: {
        backgroundColor: 'white',
        borderRadius: 15,
        alignItems: 'center',
        padding: 10,
        margin: 10
    },
    button:{
        borderRadius: 5,
        alignItems: 'center',
        padding: 5,
    },
    input: {
        borderRadius: 10,
        fontSize: 15,
        padding: 10,
        backgroundColor: '#e2e2e2',
        marginBottom: 10,
        width: 200,
      },
    buttonText: {
        color: '#fff',
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#FF6347',
        padding: 10,
        borderRadius: 5,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        margin: 5
    },
    itemContainer: {
        alignItems: 'center',
        paddingTop: 20
    },
    backButton: {
        backgroundColor: 'black',
        borderRadius: 5,
        width: 60,
        alignItems: 'center',
        padding: 10,
    },
      backButtonText: {
        alignItems: 'center',
        color: 'white',
    },
    largeText: {
        fontSize: 30,
        paddingBottom: 5
    },
    editOptions: {
      flexDirection: 'row',
      verticalAlign: 'middle'
    },
    inputCustom: {
      borderRadius: 5,
      fontSize: 15,
      padding: 10,
      backgroundColor: '#e2e2e2',
      marginBottom: 10,
      marginTop: 10,
      width: 140,
      height: 35,
      verticalAlign: 'middle'
    },
    addRemove: {
        flexDirection: 'row',
        alignItems: 'center'
    },
      addButton: {
        backgroundColor: 'green',
        borderRadius: 5,
        width: 50,
        alignItems: 'center',
        padding: 5,
        margin: 10
      },
      subtractButton: {
        backgroundColor: 'red',
        borderRadius: 5,
        width: 50,
        alignItems: 'center',
        padding: 5,
        margin: 10
      },
      edit: {
        padding: 10,
        margin: 15,
        alignItems: 'center',
        borderRadius: 25
      },
      colorShow: {
        width: 50,
        height: 50,
        margin: 10,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'white'
      },
      editButton: {
        backgroundColor: 'black',
        borderRadius: 5,
        width: 120,
        alignItems: 'center',
        padding: 5,
        margin: 10
      },
      removeButton: {
        position: 'absolute',
        bottom: 20,
        margin: 15,
        left: 0,
        right: 0,
        backgroundColor: '#f8f8f8',
        padding: 20,
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2
      }
})