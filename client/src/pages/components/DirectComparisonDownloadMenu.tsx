import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';

interface DirectComparisonDownloadMenuProps {
    isOpen?: boolean;
    onDownloadWord(): void;
    onToggle(): void;
}

/** Presentation-only direct-comparison download menu. */
function DirectComparisonDownloadMenu({isOpen, onDownloadWord, onToggle}: DirectComparisonDownloadMenuProps) {
    return <Dropdown isOpen={isOpen} toggle={onToggle}>
        <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
            Download
        </DropdownToggle>
        <DropdownMenu>
            <DropdownItem onClick={onDownloadWord}>Direct Comparison Approach Summary (docx)</DropdownItem>
            {/*<DropdownItem onClick={() => view.downloadExcelSummary()}>Direct Comparison Approach Spreadsheet (xlsx)</DropdownItem>*/}
        </DropdownMenu>
    </Dropdown>;
}

export default DirectComparisonDownloadMenu;
