import PropTypes from 'prop-types';
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import ReactModal from 'react-modal';
import Modal from '../components/modal/modal.jsx';
import VM from 'scratch-vm';
import {injectIntl, intlShape} from 'react-intl';

import ErrorBoundaryHOC from '../lib/error-boundary-hoc.jsx';
import {getIsError, getIsShowingProject} from '../reducers/project-state';
import {activateTab, BLOCKS_TAB_INDEX, COSTUMES_TAB_INDEX, SOUNDS_TAB_INDEX} from '../reducers/editor-tab';
import {closeCostumeLibrary, closeBackdropLibrary, closeTelemetryModal, openExtensionLibrary} from '../reducers/modals';

import FontLoaderHOC from '../lib/font-loader-hoc.jsx';
import LocalizationHOC from '../lib/localization-hoc.jsx';
import SBFileUploaderHOC from '../lib/sb-file-uploader-hoc.jsx';
import ProjectFetcherHOC from '../lib/project-fetcher-hoc.jsx';
import TitledHOC from '../lib/titled-hoc.jsx';
import ProjectSaverHOC from '../lib/project-saver-hoc.jsx';
import storage from '../lib/storage';
import vmListenerHOC from '../lib/vm-listener-hoc.jsx';
import vmManagerHOC from '../lib/vm-manager-hoc.jsx';
import cloudManagerHOC from '../lib/cloud-manager-hoc.jsx';
import TWFullScreenResizerHOC from '../lib/tw-fullscreen-resizer-hoc.jsx';

import GUIComponent from '../components/gui/gui.jsx';
import {setIsScratchDesktop} from '../lib/isScratchDesktop.js';

import RandomProjectNameButton from '../components/random-project-name-button/random-project-name-button.jsx';

class GUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginData: {},
            showModal: true
        };

        this.handleMessage = this.handleMessage.bind(this);
        this.handleVmInit = this.handleVmInit.bind(this);
    }

    componentDidMount() {
        window.addEventListener('message', this.handleMessage);
        setIsScratchDesktop(this.props.isScratchDesktop);
        this.props.onStorageInit(storage);

        // safe VM initialization
        this.handleVmInit(this.props.vm);
    }

    componentWillUnmount() {
        window.removeEventListener('message', this.handleMessage);
    }

    handleMessage(event) {
        if (event.origin !== 'https://www.snail-ide.com') return;
        this.setState({ loginData: event.data });
        console.log(event.data);
    }

    handleVmInit(vm) {
        if (!vm) return;

        // Wait for the renderer to exist
        if (vm.runtime?.renderer) {
            try {
                // Example of safely calling renderer methods
                vm.runtime.renderer.setPrivateSkinAccess?.(true);
            } catch (e) {
                console.warn('VM renderer not ready:', e);
            }
        }
        this.props.onVmInit(vm);
    }

    componentDidUpdate(prevProps) {
        if (this.props.projectId !== prevProps.projectId && this.props.projectId !== null) {
            this.props.onUpdateProjectId(this.props.projectId);
        }
        if (this.props.isShowingProject && !prevProps.isShowingProject) {
            this.props.onProjectLoaded();
        }
    }

    render() {
        if (this.props.isError) {
            throw new Error(
                `Error in GUI [location=${window.location}]: ${this.props.error.stack ? this.props.error.stack : this.props.error}`
            );
        }

        const {
            children,
            fetchingProject,
            isLoading,
            loadingStateVisible,
            isPlayground,
            onChangedProjectTitle,
            ...componentProps
        } = this.props;

        return (
            <>
                <GUIComponent
                    loading={fetchingProject || isLoading || loadingStateVisible}
                    isPlayground={isPlayground}
                    username={this.state.loginData.packet?.username}
                    {...componentProps}
                >
                    {children}

                    {/* Random Project Name Button */}
                    <RandomProjectNameButton onChangedProjectTitle={onChangedProjectTitle} />
                </GUIComponent>

                {this.state.showModal && (
                    <Modal
                        contentLabel="Banana-mod 🍌"
                        onRequestClose={() => this.setState({ showModal: false })}
                        styleContent={{ width: "400px" }}
                    >
                        <div style={{ padding: '5px', backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
                            <h1>Welcome to Banana-mod!</h1>
                            <p>This is a mod of Snail-ide that is a mod of PenguinMod that is a mod of Turbowarp which is a mod of Scratch.</p>
                            <p>Banana-mod adds features such as:</p>
                            <ul>
                                <li>Extra Extensions</li>
                                <li>Extra Features</li>
                                <li>Bananas 🍌</li>
                                <li>And a lot more!</li>
                            </ul>
                            <i>Enjoy programing! XD</i>
                        </div>
                    </Modal>
                )}
            </>
        );
    }
}

GUI.propTypes = {
    children: PropTypes.node,
    fetchingProject: PropTypes.bool,
    isLoading: PropTypes.bool,
    isPlayground: PropTypes.bool,
    onVmInit: PropTypes.func,
    onStorageInit: PropTypes.func,
    onProjectLoaded: PropTypes.func,
    onUpdateProjectId: PropTypes.func,
    onChangedProjectTitle: PropTypes.func.isRequired,
    projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    vm: PropTypes.instanceOf(VM).isRequired
};

GUI.defaultProps = {
    onStorageInit: storageInstance => storageInstance.addOfficialScratchWebStores(),
    onProjectLoaded: () => {},
    onUpdateProjectId: () => {},
    onVmInit: () => {}
};

const mapStateToProps = state => {
    const loadingState = state.scratchGui.projectState.loadingState;
    return {
        isShowingProject: getIsShowingProject(loadingState),
        error: state.scratchGui.projectState.error,
        isError: getIsError(loadingState),
        vm: state.scratchGui.vm
    };
};

const mapDispatchToProps = dispatch => ({
    onChangedProjectTitle: title => dispatch({ type: 'SET_PROJECT_TITLE', title }),
    onVmInit: vm => {}
});

export default TitledHOC(connect(mapStateToProps, mapDispatchToProps)(GUI));
