import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import { useHistory } from 'react-router-dom'
/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function EditToolbar() {
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();

    function handleUndo() {
        store.undo();
    }
    function handleRedo() {
        store.redo();
    }
    function handleClose() {
        history.push("/");
        store.closeCurrentList();
    }
    let undoButtonClass = "top5-button-disabled";
    let redoButtonClass = "top5-button-disabled";
    let closeButtonClass = "top5-button-disabled";

    // let editStatus = false;
    // if (store.isListNameEditActive) {
    //     editStatus = true;
    // }
    let itemEditStatus = false;
    if (store.isItemEditActive){
        itemEditStatus = true;
    }
    if (!itemEditStatus){
        if (store.currentList !== null){
            closeButtonClass = "top5-button";
            if (store.hasUndo){
                undoButtonClass = "top5-button";
            } else {
                undoButtonClass = "top5-button-disabled";
            }
    
            if (store.hasRedo){
                redoButtonClass = "top5-button";
            } else {
                redoButtonClass = "top5-button-disabled";
            }
        }
    }
    
    return (
        <div id="edit-toolbar">
            <div
                disabled={itemEditStatus}
                id='undo-button'
                onClick={handleUndo}
                className={undoButtonClass}>
                &#x21B6;
            </div>
            <div
                disabled={itemEditStatus}
                id='redo-button'
                onClick={handleRedo}
                className={redoButtonClass}>
                &#x21B7;
            </div>
            <div
                disabled={itemEditStatus}
                id='close-button'
                onClick={handleClose}
                className={closeButtonClass}>
                &#x24E7;
            </div>
        </div>
    )
}

export default EditToolbar;