{/* <Text>Unique Identifier: {identifier}</Text> */}
        {/* <TouchableOpacity onPress={readNdef}>
          <Text>Read Tag</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity onPress={writeNFC}>
          <Text>Write Tag</Text>
        </TouchableOpacity> */}

        const writeNFC = async() => {
            let result = false
        
            try{
              await nfcManager.requestTechnology(NfcTech.Ndef);
        
              const bytes = Ndef.encodeMessage([Ndef.textRecord('0312323243')]);
        
              if(bytes) {
                await nfcManager.ndefHandler.writeNdefMessage(bytes);
                result = true
              }
            } catch(ex){
              console.warn(ex)
            } finally {
              nfcManager.cancelTechnologyRequest();
            }
          }