import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import ChangeItem_Transaction from '../transactions/ChangeItem_Transaction';
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_ITEM_NAME_EDIT_ACTIVE: "SET_ITEM_NAME_EDIT_ACTIVE",
    ADD_LIST: "ADD_LIST",
    MARKED_DELETE_LIST: "MARKED_DELETE_LIST",
    DELETE_LIST: "DELETE_LIST",
    UPDATE_TOOLBAR: "UPDATE_TOOLBAR"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false,
        itemActive: false,
        listMarkedForDeletion: null,
        hasUndo: false,
        hasRedo: false
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: payload.hasUndo,
                    hasRedo: payload.hasRedo
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: payload.cardStatus,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false
                });
            }

            case GlobalStoreActionType.SET_ITEM_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: true,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false
                });
            }
            // ADD LIST
            case GlobalStoreActionType.ADD_LIST: {
                return setStore({
                    idNamePairs: payload.idPairs,
                    currentList: payload.currentList,
                    newListCounter: payload.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false
                });
            }
            // MARK DELETE LIST
            case GlobalStoreActionType.MARKED_DELETE_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: store.isListNameEditActive,
                    isItemEditActive: store.isItemEditActive,
                    listMarkedForDeletion: payload.idNamePair,
                    hasUndo: false,
                    hasRedo: false
                });
            }
            // DELETE LIST
            case GlobalStoreActionType.DELETE_LIST: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: false,
                    hasRedo: false
                });
            }
            // UPDATE TOOLBAR
            case GlobalStoreActionType.UPDATE_TOOLBAR: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    hasUndo: payload.hasUndo,
                    hasRedo: payload.hasRedo
                });
            }
            default:
                return store;
        }
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                top5List.name = newName;
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        // top5List: top5List
                                        top5List: null
                                    }
                                });
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getTop5ListPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }

    //Change item name
    store.addChangeItemTransaction = function (index, newText) {
        let oldText = store.currentList.items[index];
        console.log(oldText);
        let transaction = new ChangeItem_Transaction(store, index, oldText, newText);
        tps.addTransaction(transaction);
    }

    store.renameItem = function (index, text) {
        store.currentList.items[index] = text;
        store.updateCurrentList();
    }

    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList().then((_) => {store.updateToolbar()});
    }

    store.updateToolbar = function () {
        storeReducer ({
            type: GlobalStoreActionType.UPDATE_TOOLBAR,
            payload: {
                currentList: store.currentList,
                hasUndo: tps.hasTransactionToUndo(),
                hasRedo: tps.hasTransactionToRedo()
            }
        })
    }


    store.undo = function () {
        if (tps.hasTransactionToUndo()){
            tps.undoTransaction();
        } else {
            console.log("NOTHING TO UNDO");
        }
    }
    store.redo = function () {
        if (tps.hasTransactionToRedo()){
            tps.doTransaction();
        } else {
            console.log("NOTHING TO REDO");
        }
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function (cardStatus) {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: {
                currentList: null,
                cardStatus: cardStatus
            }
        });
    }

    // This enables item name edit
    store.setIsItemNameEditActive = function (itemEditStatus) {
        storeReducer({
            type: GlobalStoreActionType.SET_ITEM_NAME_EDIT_ACTIVE,
            payload: {
                currentList: store.currentList,
                itemEditStatus: itemEditStatus
            }
        });
    }

    //function to add list
    store.addList = function () {
        var x;
        async function asyncAddList () {
            const response = await api.createTop5List({
                "name": `Untitled${store.newListCounter}`,
                "items": [
                    "?",
                    "?",
                    "?",
                    "?",
                    "?"
                ]
            });
            if (response.data.success){
                let id = response.data.top5List._id;
                const response1 = await api.getTop5ListPairs();
                if (response1.data.success){
                    let idPairs = response1.data.idNamePairs;
                    const response2 = await api.getTop5ListById(id);
                    if (response2.data.success){
                        let top5List = response2.data.top5List;
                        const response3 = await api.updateTop5ListById(top5List._id, top5List);
                        if (response3.data.success){
                            storeReducer({
                                type: GlobalStoreActionType.ADD_LIST,
                                payload: {
                                    newListCounter: store.newListCounter + 1,
                                    idPairs: idPairs,
                                    currentList: top5List
                                }
                            });
                            store.history.push("/top5list/" + top5List._id);
                        }
                    }
                }
            }
            console.log(store);
            console.log(store.newListCounter);
        }
        asyncAddList();
    }

    //Display modal, if yes then delete marked list, if no then hide modal
    store.displayDeleteListModal = function (idNamePair) {
        storeReducer({
            type: GlobalStoreActionType.MARKED_DELETE_LIST,
            payload: {idNamePair: idNamePair}
        });
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    store.hideDeleteListModal = function () {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    store.deleteMarkedList = function () {
        async function asyncDeleteMarkedList () {
            const response = await api.deleteTop5ListById(store.listMarkedForDeletion._id);
            if (response.data.success){
                const response1 = await api.getTop5ListPairs();
                if (response1.data.success){
                    storeReducer({
                        type: GlobalStoreActionType.DELETE_LIST,
                        payload: response1.data.idNamePairs
                    });
                }
            }
        }
        asyncDeleteMarkedList();
        store.hideDeleteListModal();
        //This forces a state update which refreshes the react components
        store.loadIdNamePairs();
    }

    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}