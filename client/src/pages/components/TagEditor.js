import React from 'react';
import AsyncCreatable from 'react-select/lib/AsyncCreatable';
import {Button} from 'reactstrap';
import axios from "axios/index";
import _ from "underscore";


class TagEditor extends React.Component {
    state = {
        selectedOption: null,
        tags: []
    };

    static getDerivedStateFromProps(props, state)
    {
        if (props.value)
        {
            return {tags: props.value.map((tag) =>
                {
                    return {
                        value: tag,
                        label: tag
                    }
                })
            };
        }
        return {};
    }

    componentDidMount()
    {
        this.reloadDefaults();
    }

    componentDidUpdate()
    {
        if (this.props.propertyType !== this.propertyType)
        {
            this.propertyType = this.props.propertyType;
            this.reloadDefaults();
        }
    }

    reloadDefaults()
    {
        const search = {};

        if (this.props.propertyType)
        {
            search['propertyType'] = this.props.propertyType;
        }

        axios.get(`/property_tags`, {params: search}).then((response) =>
        {
            this.setState({
                defaultOptions: response.data.tags.map((tag) => ({value: tag._id['$oid'], label: tag.name}) )
            });
        });
    }

    onCreateTag(data)
    {
        const newTag = {name: data};

        if (this.props.propertyType)
        {
            newTag['propertyType'] = this.props.propertyType;
        }

        axios.post(`/property_tags`, newTag).then((response) =>
        {
            this.setState((state) => {
                state.tags.push({value: data, label: data});
            }, () => this.props.onChange(this.state.tags.map((tag) => tag.label)));
        });
    }

    loadOptions(inputValue, callback)
    {
        const search = {name: inputValue};
        if (this.props.propertyType)
        {
            search['propertyType'] = this.props.propertyType;
        }

        axios.get(`/property_tags`, {params: search}).then((response) =>
        {
            callback(response.data.tags.map((tag) => ({value: tag._id['$oid'], label: tag.name}) ));
        });
    }


    onChange(newTags)
    {
        if (this.props.onChange)
        {
            this.props.onChange(newTags.map((tag) => tag.label));
            this.setState({tags: newTags});
        }
    }

    deleteTag(evt, tagId)
    {
        evt.stopPropagation();
        axios.delete(`/property_tags/` + tagId).then((response) =>
        {
            this.selectRef.blur();
        });
    }

    render()
    {
        // const { selectedOption } = this.state;

        const CustomOption = (data) =>
        {
            // alert(JSON.stringify(data, null, 4));
            return !data.isDisabled ? (
                <div {...(data.innerProps)} className={"tag-editor-option"}>
                    {data.data.label}

                    {
                        !data.data.__isNew__ ?
                            <Button className={"delete-tag-button"} color={"secondary"} onClick={(evt) => this.deleteTag(evt, data.value)} >
                                <i className={"fa fa-times"} />
                            </Button> : null
                    }
                </div>
            ) : null;
        };

        return (
            <AsyncCreatable
                className={"tag-editor"}
                classNamePrefix={"tag-editor"}
                value={this.state.tags}
                // cacheOptions
                isClearable
                isMulti
                defaultOptions={this.state.defaultOptions}
                loadOptions={(inputValue, callback) => this.loadOptions(inputValue, callback)}
                onCreateOption={(data) => this.onCreateTag(data)}
                noOptionsMessage={() => <span>Search for or Type in a Tag</span>}
                ref={(ref) => this.selectRef = ref}
                onChange={(data) => this.onChange(data)}
                onBlur={this.props.onBlur}
                components={{ Option: CustomOption }}
            />
        );
    }
}



export default TagEditor;
