import React, { Component } from 'react';
import Editor, { composeDecorators } from 'draft-js-plugins-editor';
import { EditorState, SelectionState, Modifier } from 'draft-js';
import createImagePlugin from 'draft-js-image-plugin';
import createAlignmentPlugin from 'draft-js-alignment-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import createResizeablePlugin from 'draft-js-resizeable-plugin';
import createBlockDndPlugin from 'draft-js-drag-n-drop-plugin';
import createDragNDropUploadPlugin from './draft-js-drag-n-drop-upload-plugin';
import createToolbarPlugin, { Separator } from 'draft-js-static-toolbar-plugin';
import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
  CodeBlockButton,
} from 'draft-js-buttons';
//import mockUpload from './mockUpload';
import createKatexPlugin from './CreateKatexPlugin.js';
import 'draft-js/dist/Draft.css';
import 'draft-js-alignment-plugin/lib/plugin.css';
import 'draft-js-static-toolbar-plugin/lib/plugin.css';
import './editorStyles.css';
import { createImage } from './modifiers/addImage.js';

class HeadlinesPicker extends Component {
  componentDidMount() {
    setTimeout(() => { window.addEventListener('click', this.onWindowClick); });
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onWindowClick);
  }

  onWindowClick = () =>
    // Call `onOverrideContent` again with `undefined`
    // so the toolbar can show its regular content again.
    this.props.onOverrideContent(undefined);

  render() {
    const buttons = [HeadlineOneButton, HeadlineTwoButton, HeadlineThreeButton];
    return (
      <div>
        {buttons.map((Button, i) => // eslint-disable-next-line
          <Button key={i} {...this.props} />
        )}
      </div>
    );
  }
}

class HeadlinesButton extends Component {
  onClick = () =>
    // A button can call `onOverrideContent` to replace the content
    // of the toolbar. This can be useful for displaying sub
    // menus or requesting additional information from the user.
    this.props.onOverrideContent(HeadlinesPicker);

  render() {
    return (
      <div className="headlineButtonWrapper">
        <button onClick={this.onClick} className="headlineButton">
          H
        </button>
      </div>
    );
  }
}

class TexifyButton extends Component {
  onClick = () => {
    let editorState = this.props.getEditorState();
    let contentState = editorState.getCurrentContent();
    let selection = editorState.getSelection();
    let blockKey = selection.getStartKey();
    let currentBlock = contentState.getBlockForKey(blockKey);
    let ofs = selection.getStartOffset();
    let endOfs = selection.getEndOffset();
    let endBlockKey = selection.getEndKey();
    let curText = currentBlock.getText();
    let texBegin = -1;
    while (blockKey !== endBlockKey || ofs !== endOfs) {
      if (ofs < currentBlock.getLength()) {
        if (curText[ofs] === '$' && texBegin !== -1) {
          contentState = contentState.createEntity(
            'INLINETEX', 'IMMUTABLE',
            {teX: curText.slice(texBegin + 1, ofs), displaystyle: false}
          );
          const entityKey = contentState.getLastCreatedEntityKey();
          if (texBegin === 0) {
            contentState = Modifier.insertText(contentState,
              new SelectionState({
                anchorKey: blockKey,
                anchorOffset: 0,
                focusKey: blockKey,
                focusOffset: 0,
                isBackward: false,
                hasFocus: true}), ' ');
            ++ofs;
            ++texBegin;
            if (blockKey === endBlockKey) {
              ++endOfs;
            }
          }
          if (ofs === currentBlock.getLength() - 1) {
            contentState = Modifier.insertText(contentState,
              new SelectionState({
                anchorKey: blockKey,
                anchorOffset: currentBlock.getLength(),
                focusKey: blockKey,
                focusOffset: currentBlock.getLength(),
                isBackward: false,
                hasFocus: true}), ' ');
          }
        
          contentState = Modifier.replaceText(contentState,
            new SelectionState({
              anchorKey: blockKey,
              anchorOffset: texBegin,
              focusKey: blockKey,
              focusOffset: ofs + 1,
              isBackward: false,
              hasFocus: true
            }), '\t\t', undefined, entityKey);
          currentBlock = contentState.getBlockForKey(blockKey);
          curText = currentBlock.getText();
          if (blockKey === endBlockKey) {
            endOfs -= ofs + 1 - texBegin - 2;
          }
          ofs = texBegin + 2;
          texBegin = -1;
        } else {
          if (curText[ofs] === '$') {
            texBegin = ofs;
          }
          ++ofs;
        }
      } else {
        blockKey = contentState.getKeyAfter(blockKey);
        currentBlock = contentState.getBlockForKey(blockKey);
        curText = currentBlock.getText();
        ofs = 0;
        texBegin = -1;
      }
    }
    editorState = EditorState.push(editorState, contentState, 'apply-entity');
    editorState = EditorState.forceSelection(editorState, editorState.getCurrentContent().getSelectionAfter());
    this.props.setEditorState(editorState);
  }

  render() {
    return (
      <div className="headlineButtonWrapper">
        <button onClick={this.onClick} className="headlineButton">
          Texify
        </button>
      </div>
    );
  }
}

class ImageButton extends Component {
  onClick = () =>
  {
    let file;
    const imgTypes = /image\//;
    const virtualElement = document.createElement('input');
  
    virtualElement.setAttribute('type', 'file');
    virtualElement.setAttribute('accept', 'image/*');
    virtualElement.click();
  
    // user opened (selected) files on the popup----proceed further to handle it / upload
    virtualElement.addEventListener('change', () => {
      file = virtualElement.files[0];
      const fileReader = new FileReader();
  
      fileReader.onerror = (e) => console.log(`Unable to proceed with the file requested. Error: ${e.detail}`);
      // user submits an image successfully
      fileReader.onload = () => {
  
        if (imgTypes.test(file.type)) {
          createImage(fileReader.result, this.props.getEditorState, this.props.setEditorState);
          console.log('Image inserted successfully');
  
        } else {
  
          // can handle some modal/popup/tooltip alerting user of wrong file type
          console.error('The file type requested is not an image type!');
          return false;
        }
      };
      // finally, begin loading the image and fire the event handlers
      fileReader.readAsDataURL(file);
    });
  }
  render() {
    return (
      <div className="headlineButtonWrapper">
        <button onClick={this.onClick} className="headlineButton">
          Img
        </button>
      </div>
    );
  }
}


const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();
const { AlignmentTool } = alignmentPlugin;
const toolbarPlugin = createToolbarPlugin({
  structure: [
    BoldButton,
    ItalicButton,
    UnderlineButton,
    CodeButton,
    Separator,
    HeadlinesButton,
    UnorderedListButton,
    OrderedListButton,
    BlockquoteButton,
    CodeBlockButton,
    Separator,
    ImageButton,
    Separator,
    TexifyButton
  ]
});
const { Toolbar } = toolbarPlugin;
const decorator = composeDecorators(
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  focusPlugin.decorator,
  blockDndPlugin.decorator
);
const imagePlugin = createImagePlugin({ decorator });
const dragNDropFileUploadPlugin = createDragNDropUploadPlugin({
  handleUpload: true,
  addImage: imagePlugin.addImage,
});

const katexPlugin = createKatexPlugin();

const plugins = [
  dragNDropFileUploadPlugin,
  blockDndPlugin,
  focusPlugin,
  alignmentPlugin,
  imagePlugin,
  resizeablePlugin,
  toolbarPlugin,
  katexPlugin,
];

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
  };
  onChange = (editorState) => this.setState({editorState});
  focus = () => setTimeout(this.editor.focus, 50);
  render() {
    return (
      <div>
        <div className="editor" onClick={this.focus}>
          <Toolbar />
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => { this.editor = element; }}
          />
          <AlignmentTool />
        </div>
      </div>
    );
  }
}

export default MyEditor;
