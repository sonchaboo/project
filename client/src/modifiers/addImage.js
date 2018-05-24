import { EditorState, AtomicBlockUtils } from 'draft-js';

export const createImage = (src, getEditorState, onChange) => {
    // src should be image data or an image URL
    const editorState = getEditorState();
    const contentStateWithEntity = editorState.getCurrentContent().createEntity('IMAGE', 'IMMUTABLE', { src });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
    onChange(EditorState.forceSelection(newEditorState, newEditorState.getCurrentContent().getSelectionAfter()));
  };