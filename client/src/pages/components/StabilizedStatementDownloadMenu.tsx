import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';

interface StabilizedStatementDownloadMenuProps {
    isOpen?: boolean;
    onDownloadWord(): void;
    onToggle(): void;
}

/** Presentation-only download control with the existing labels and order. */
function StabilizedStatementDownloadMenu({isOpen, onDownloadWord, onToggle}: StabilizedStatementDownloadMenuProps) {
    return <Dropdown isOpen={isOpen} toggle={onToggle}>
        <DropdownToggle caret color={"primary"} className={"download-dropdown-button"}>
            Download
        </DropdownToggle>
        <DropdownMenu>
            <DropdownItem onClick={onDownloadWord}>Stabilized Statement Summary (docx)</DropdownItem>
            {/*<DropdownItem onClick={() => view.downloadExcelSummary()}>Stabilized Statement Spreadsheet (xlsx)</DropdownItem>*/}
        </DropdownMenu>
    </Dropdown>;
}

export default StabilizedStatementDownloadMenu;
